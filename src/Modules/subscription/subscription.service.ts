import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Subscription } from "./subscription.entity";
import { Repository } from "typeorm";
import { PlanService } from "../plan/plan.service";
import { PlanStatus } from "src/Shared/Enums/plan.enum";

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,

    private planService: PlanService,
  ) {}

  public async createSubscription(planId: string, userId: string) {
    const plan = await this.planService.getPlanById(planId);

    if (!plan) {
      throw new BadRequestException("no plan found");
    }
    const startDate = new Date();

    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    const sub = this.subscriptionRepository.create({
      plan: {
        id: planId,
      },
      user: {
        id: userId,
      },
      startDate,
      endDate,
    });

    const subscription = await this.subscriptionRepository.save(sub);

    return {
      data: { subscription },
    };
  }

  public async countSubscription() {
    return this.subscriptionRepository.count();
  }

  public async countEnterpriseSubscribers() {
    const count = await this.subscriptionRepository
      .createQueryBuilder("sub")
      .leftJoin("sub.plan", "plan")
      .where("plan.name = :name", { name: "Enterprise" })
      .getCount();

    return count;
  }

  public async countProSubscribers() {
    return this.subscriptionRepository.count({
      where: { plan: { name: "Pro" } },
    });
  }

  public async mrr() {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    );

    return this.subscriptionRepository
      .createQueryBuilder("sub")
      .where("sub.createdAt BETWEEN :start AND :end", {
        start: startOfMonth,
        end: endOfMonth,
      })
      .getCount();
  }

  public allSubscription() {
    return this.subscriptionRepository.count();
  }
}
