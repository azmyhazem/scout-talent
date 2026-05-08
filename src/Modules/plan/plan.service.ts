import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Plan } from "./plan.entity";
import { Repository } from "typeorm";
import { CreatePlanDto } from "./dto/createPlan.dto";
import { PlanFeaturePermission } from "./plan-feature-permission.entity";
import { FeatureService } from "../features/feature.service";
import { PlanPermissionDto } from "./dto/planPermission.dto";

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
    return this.planRepository.find();
  }

  public async getPlanById(id: string) {
    return this.planRepository.findOne({
      where: { id },
    });
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
