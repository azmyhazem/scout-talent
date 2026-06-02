import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Plan } from "./plan.entity";
import { Repository } from "typeorm";
import { CreatePlanDto } from "./dto/createPlan.dto";
import { PlanFeaturePermission } from "./plan-feature-permission.entity";
import { FeatureService } from "../features/feature.service";
import { PlanPermissionDto } from "./dto/planPermission.dto";
import { UpdatePlanDto } from "./dto/update-plan.dto";

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,

    @InjectRepository(PlanFeaturePermission)
    private planFeaturePermissionRepository: Repository<PlanFeaturePermission>,

    private featureService: FeatureService,
  ) {}

  public async getAllPlan() {
    return this.planRepository.find({
      relations: {
        planFeaturePermissions: {
          featurePermission: {
            feature: true,
          },
        },
      },
    });
  }

  public async getPlanById(id: string) {
    return this.planRepository.findOne({
      where: { id },
      relations: ["planFeaturePermissions"],
    });
  }

  public async getPlanDefault() {
    return this.planRepository.findOne({
      where: { isDefault: true, isActive: true },
    });
  }

  public async defaultPlan(planId: string) {
    const plan = await this.getPlanById(planId);

    if (!plan) {
      throw new BadRequestException("plan not found");
    }

    if (plan.isDefault) {
      throw new BadRequestException("this plan is already default");
    }

    const currentDefaultPlan = await this.planRepository.findOne({
      where: {
        isDefault: true,
        isActive: true,
      },
    });

    if (currentDefaultPlan) {
      currentDefaultPlan.isDefault = false;
      await this.planRepository.save(currentDefaultPlan);
    }

    plan.isDefault = true;

    await this.planRepository.save(plan);

    return {
      message: "default plan updated successfully",
    };
  }

  async createPlan(dto: CreatePlanDto) {
    const { name, description, price, permissions, currency, durationInDays } =
      dto;

    const pla = this.planRepository.create({
      name,
      description,
      price,
      currency,
      durationInDays,
    });

    const plan = await this.planRepository.save(pla);

    await this.createPlanFeaturePermissions(plan, permissions);

    return { data: { message: "create plan successful" } };
  }

  public async countAllPlans() {
    return this.planRepository.count();
  }

  public async countAllPlansActive() {
    return this.planRepository.count({
      where: {
        isActive: true,
      },
    });
  }

  public async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.planRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException("Plan not found");
    }

    Object.assign(plan, dto);

    return await this.planRepository.save(plan);
  }

  public async delete(id: string): Promise<void> {
    const result = await this.planRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException("Plan not found");
    }
  }

  private async createPlanFeaturePermissions(
    plan: Plan,
    permissions: PlanPermissionDto[],
  ) {
    // get ids
    const featurePermissionIds = permissions.map(
      (item) => item.featurePermissionId,
    );

    // get feature permissions from db
    const featurePermissions =
      await this.featureService.getFeaturePermissionsByIds(
        featurePermissionIds,
      );

    // validation
    if (featurePermissions.length !== featurePermissionIds.length) {
      throw new NotFoundException("Some feature permissions not found");
    }

    // create map for faster lookup
    const featurePermissionMap = new Map(
      featurePermissions.map((fp) => [fp.id, fp]),
    );

    // create rows
    const rows = permissions.map((item) => {
      return this.planFeaturePermissionRepository.create({
        plan,
        featurePermission: featurePermissionMap.get(item.featurePermissionId),
        limitCount: item.limitCount ?? null,
      });
    });

    // save
    await this.planFeaturePermissionRepository.save(rows);
  }
}
