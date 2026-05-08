import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { ApiQuery, ApiSecurity } from "@nestjs/swagger";
import { CreatePlanDto } from "../plan/dto/createPlan.dto";

@Controller("admin")
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get("dashboard")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async dashboardAdmin() {
    return this.adminService.dashboardAdmin();
  }

  @Get("users")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 6 })
  async usersList(@Query("page") page: number, @Query("limit") limit: number) {
    return this.adminService.usersList(page, limit);
  }

  @Get("users/:id")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async userDetails(@Param("id") id: string) {
    return this.adminService.userDetails(id);
  }

  @Patch("users/:id/ban")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async userBan(@Param("id") id: string) {
    return this.adminService.banUser(id);
  }

  @Patch("users/:id/unban")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async userUnBan(@Param("id") id: string) {
    return this.adminService.unBanUser(id);
  }

  @Get("companies")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 6 })
  async compnaiesList(
    @Query("page") page: number,
    @Query("limit") limit: number,
  ) {
    return this.adminService.companiesList(page, limit);
  }

  @Get("companies/:id")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async companyDetails(@Param("id") id: string) {
    return this.adminService.companyDetails(id);
  }

  @Get("jobs")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 6 })
  async jobsList(@Query("page") page: number, @Query("limit") limit: number) {
    return this.adminService.jobsList(page, limit);
  }

  @Get("jobs/:id")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async jobDetails(@Param("id") id: string) {
    return this.adminService.jobDetails(id);
  }

  @Get("plans")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async plans() {
    return this.adminService.getPlans();
  }

  @Post("plans")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async createPlan(@Body() body: CreatePlanDto) {
    return this.adminService.createPlans(body);
  }

  @Get("subscriptions")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async subscription() {
    return this.adminService.getSubscription();
  }
}
