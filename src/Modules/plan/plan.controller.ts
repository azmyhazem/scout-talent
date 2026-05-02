import { Body, Controller, Get} from "@nestjs/common";
import { PlanService } from "./plan.service";


@Controller("plans")
export class PlanController {
  constructor(private planService: PlanService) {}

  @Get("all")
  public allPlan() {
    return this.planService.getAllPlan();
  }

}
