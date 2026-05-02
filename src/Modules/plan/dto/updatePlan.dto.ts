import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreatePlanDTO } from "./createPlan.dto";
import { PlanStatus } from "src/Shared/Enums/plan.enum";
import { IsEnum } from "class-validator";

export class UpdatePlanDTO extends PartialType(CreatePlanDTO) {
  @IsEnum(PlanStatus)
  @ApiPropertyOptional({ enum: PlanStatus })
  status?: PlanStatus;
}