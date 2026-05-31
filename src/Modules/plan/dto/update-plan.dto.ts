import { PartialType } from "@nestjs/swagger";
import { CreatePlanDto } from "./createPlan.dto";

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
