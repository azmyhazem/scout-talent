import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { PlanService } from "./plan.service";
import { CreatePlanDto } from "./dto/createPlan.dto";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { ApiSecurity } from "@nestjs/swagger";
import { UpdatePlanDto } from "./dto/update-plan.dto";

@Controller("plans")
export class PlanController {
  constructor(private planService: PlanService) {}

  @Get("all")
  public allPlan() {
    return this.planService.getAllPlan();
  }

  @Get("/:id")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public getPlan(@Param("id") id: string) {
    return this.planService.getPlanById(id);
  }

  @Post("create")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  createPlan(@Body() body: CreatePlanDto) {
    return this.planService.createPlan(body);
  }

  @Patch(":id/default")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async defaultPlan(@Param("id") id: string) {
    return await this.planService.defaultPlan(id);
  }

  @Patch(":id")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async updatePlan(@Body() body: UpdatePlanDto, @Param("id") id: string) {
    return this.planService.update(id, body);
  }

  @Delete(":id")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async deletePlan(@Param("id") id: string) {
    return this.planService.delete(id);
  }
}
