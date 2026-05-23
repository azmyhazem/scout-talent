import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { FeatureUsage } from 'src/Modules/features/feature-usage.entity';
import { PlanFeaturePermission } from 'src/Modules/plan/plan-feature-permission.entity';
import { Subscription } from 'src/Modules/subscription/subscription.entity';
import { Repository } from 'typeorm';
import { PERMISSION_KEY } from '../decorator/permission.decorator';
import { SubscriptionStatus } from 'src/Shared/Enums/subscription.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,

    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,

    @InjectRepository(PlanFeaturePermission)
    private planFeaturePermissionRepo: Repository<PlanFeaturePermission>,

    @InjectRepository(FeatureUsage)
    private featureUsageRepo: Repository<FeatureUsage>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1️⃣ Read the required permission name from the decorator
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @RequirePermission() decorator → public route
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest();
    const userId: string = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Get active subscription
    // relation: subscription.user (no user_id column — it's a relation)
    // ─────────────────────────────────────────────────────────────────────────
    const subscription = await this.subscriptionRepo
      .createQueryBuilder('s')
      .innerJoin('s.user', 'u')           // join the user relation
      .innerJoin('s.plan', 'plan')        // join plan so we have plan.id later
      .addSelect(['plan.id'])
      .where('u.id = :userId', { userId })
      .andWhere('s.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('s.endDate >= CURRENT_DATE')
      .getOne();

    if (!subscription) {
      throw new UnauthorizedException('No active subscription found');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Check if the plan includes this permission (endpoint)
    // joins: pfp → featurePermission → permission  (using camelCase relations)
    // ─────────────────────────────────────────────────────────────────────────
    const planPermission = await this.planFeaturePermissionRepo
      .createQueryBuilder('pfp')
      .innerJoin('pfp.plan', 'plan')
      .innerJoin('pfp.featurePermission', 'fp')
      .innerJoin('fp.permission', 'p')
      .where('plan.id = :planId', { planId: subscription.plan.id })
      .andWhere('p.name = :name', { name: requiredPermission })
      .select([
        'pfp.id          AS "pfpId"',
        'pfp.limitCount  AS "limitCount"',
        'fp.id           AS "featurePermissionId"',
      ])
      .getRawOne<{
        pfpId: string;
        limitCount: number | null;
        featurePermissionId: string;
      }>();

    if (!planPermission) {
      throw new ForbiddenException(
        `Your plan does not include access to: "${requiredPermission}". Please upgrade.`,
      );
    }

    const limitCount         = planPermission.limitCount;          // null = unlimited
    const featurePermissionId = planPermission.featurePermissionId;

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: Check usage limit
    // null or -1 means unlimited → skip the check
    // ─────────────────────────────────────────────────────────────────────────
    if (limitCount !== null && limitCount !== -1) {
      const usage = await this.featureUsageRepo
        .createQueryBuilder('fu')
        .innerJoin('fu.subscription', 'sub')
        .innerJoin('fu.featurePermission', 'fp')
        .where('sub.id = :subId', { subId: subscription.id })
        .andWhere('fp.id = :fpId', { fpId: featurePermissionId })
        .andWhere('fu.periodStart <= CURRENT_DATE')
        .andWhere('fu.periodEnd   >= CURRENT_DATE')
        .getOne();

      const usedCount = usage?.usedCount ?? 0;

      if (usedCount >= limitCount) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `You have reached the limit of ${limitCount} for: "${requiredPermission}"`,
            used:  usedCount,
            limit: limitCount,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ✅ Attach context to request for controller / UsageService
    // ─────────────────────────────────────────────────────────────────────────
    request.subscriptionId       = subscription.id;
    request.featurePermissionId  = featurePermissionId;
    request.planId               = subscription.plan.id;

    return true;
  }
}