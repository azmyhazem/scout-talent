import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JobServices } from "./job.service";
import { addJobDTO } from "./dto/addJob.dto";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { updateJobDTO } from "./dto/updateJob.dto";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { Roles } from "../../Shared/decorator/user_role.decorator";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../../Shared/decorator/currentUser.decorator";
import { jobStatusDTO } from "./dto/statusJob.dto";
import { ApiBody, ApiSecurity } from "@nestjs/swagger";
import { PermissionGuard } from "../permission/guard/permission.guard";
import { RequirePermission } from "../permission/decorator/permission.decorator";

@Controller("jobs")
export class JobController {
  constructor(private jobService: JobServices) {}

  @Post("createJob")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard, PermissionGuard)
  @ApiSecurity("bearer")
  @RequirePermission("job:create")
  public async CreateJob(
    @Body() body: addJobDTO,
    @currentUser() company: JwtPayloadType,
  ) {
    const data = await this.jobService.Addjob(body, company.id);
    return { data };
  }

  @Get("recommend/candidate/:jobId")
  @UseGuards(AuthGuard, PermissionGuard)
  @Roles(RoleUser.COMPANY)
  @ApiSecurity("bearer")
  @RequirePermission("job:get_recommended_candidates")
  public async getRecommendJob(
    @Param("jobId") jobId: string,
    @currentUser() company: JwtPayloadType,
    @Query("isRefresh", new DefaultValuePipe(false), ParseBoolPipe)
    isRefresh: boolean,
  ) {
    const data = await this.jobService.getRecommendCandidate(
      company.id,
      isRefresh,
      jobId,
    );
    return { data };
  }

  @Get("candidate/invit/:jobId/:userId/:recommendId")
  @UseGuards(AuthGuard, PermissionGuard)
  @Roles(RoleUser.COMPANY)
  @ApiSecurity("bearer")
  @RequirePermission("job:invite_candidate")
  public async invitCandidate(
    @Param("jobId") jobId: string,
    @Param("userId") userId: string,
    @Param("recommendId") recommendId: string,
    @currentUser() company: JwtPayloadType,
  ) {
    return this.jobService.invitCandidate(
      userId,
      jobId,
      recommendId,
      company.id,
    );
  }

  @Get("allJob")
  @UseGuards(AuthGuard, PermissionGuard)
  @Roles(RoleUser.APPLICANT)
  @ApiSecurity("bearer")
  @RequirePermission("job:create")
  public async GetAllJobs() {
    const data = await this.jobService.getAllJob();
    return { data };
  }

  @Get("/:id")
  public async GetJob(@Param("id") id: string) {
    const data = await this.jobService.getJob(id);
    return { data };
  }

  @Delete("/:id")
  @UseGuards(AuthGuard, PermissionGuard)
  @Roles(RoleUser.COMPANY)
  @ApiSecurity("bearer")
  @RequirePermission("job:delete")
  public async deleteJob(
    @currentUser() company: JwtPayloadType,
    @Param("id") id: string,
  ) {
    const data = await this.jobService.deleteJob(company.id, id);
    return { data };
  }

  @Put("/:id")
  @UseGuards(AuthGuard, PermissionGuard)
  @Roles(RoleUser.COMPANY)
  @ApiSecurity("bearer")
  @ApiBody({ type: updateJobDTO })
  @RequirePermission("job:update")
  public async updateJob(
    @currentUser() company: JwtPayloadType,
    @Param("id") id: string,
    @Body() body: updateJobDTO,
  ) {
    const data = await this.jobService.updateJob(company.id, id, body);
    return { data };
  }

  @Post("/:jobId/status")
  @UseGuards(AuthGuard, PermissionGuard)
  @Roles(RoleUser.COMPANY)
  @ApiSecurity("bearer")
  @RequirePermission("job:change_status")
  public async jobStatusChanging(
    @currentUser() company: JwtPayloadType,
    @Param("jobId") jobId: string,
    @Body() body: jobStatusDTO,
  ) {
    const data = await this.jobService.ChangeJobStatus(company.id, jobId, body);
    return { data };
  }
}
