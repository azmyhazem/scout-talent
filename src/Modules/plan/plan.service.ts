import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Plan } from "./plan.entity";
import { Repository } from "typeorm";
import { CreatePlanDTO } from "./dto/createPlan.dto";
import { PlanStatus } from "src/Shared/Enums/plan.enum";
import { UpdatePlanDTO } from "./dto/updatePlan.dto";

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}

  public async getAllPlan() {
    return this.planRepository.find();
  }

  public async getPlanById(id: string) {
    return this.planRepository.findOne({
      where: { id },
    });
  }

  public async createPlan(dto: CreatePlanDTO) {
    const { name, durationDays, price } = dto;

    const planC = this.planRepository.create({
      name,
      durationDays,
      price,
    });

    return this.planRepository.save(planC);
  }

  public async countAllPlans() {
    return this.planRepository.count();
  }

  public async countAllPlansActive() {
    return this.planRepository.count({
      where: {
        status: PlanStatus.ACTIVE,
      },
    });
  }

  public async updatePlan(dto: UpdatePlanDTO, planId: string) {
    return this.planRepository.update({ id: planId }, dto);
  }
}
