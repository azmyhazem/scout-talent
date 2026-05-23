import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { InterviewService } from "./interview.service";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "src/Shared/decorator/currentUser.decorator";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { completeInterviewDTO } from "./dto/completeInterview.dto";
import { rescheduleDTO } from "./dto/reschedule.dto";
import { cancelInterviewDTO } from "./dto/cancelInterview.dto";
import { CancelBy } from "src/Shared/Enums/interviewCancel.enum";
import { ApiSecurity } from "@nestjs/swagger";
import { PermissionGuard } from "../permission/guard/permission.guard";
import { RequirePermission } from "../permission/decorator/permission.decorator";

@UseGuards(PermissionGuard)
@Controller("interview")
export class InterviewController {
  constructor(private interviewService: InterviewService) {}

  @Get("company")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @RequirePermission("interview:get_all_by_company")
  public allInterviewWithCompany(@currentUser() user: JwtPayloadType) {
    return this.interviewService.getAllInterviewWithCompany(user.id);
  }

  @Post("complete/:interviewId")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @RequirePermission("interview:complete")
  public completeInterview(
    @currentUser() user: JwtPayloadType,
    @Body() body: completeInterviewDTO,
    @Param("interviewId") interviewId: string,
  ) {
    return this.interviewService.completeInterview(interviewId, user.id, body);
  }

  @Patch("reschedule/:interviewId")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @RequirePermission("interview:reschedule")
  public rescheduleInterview(
    @Param("interviewId") interviewId: string,
    @Body() body: rescheduleDTO,
    @currentUser() user: JwtPayloadType,
  ) {
    return this.interviewService.rescheduleInterview(
      interviewId,
      body,
      user.id,
    );
  }

  @Post("cancel/:interviewId")
  @Roles(RoleUser.APPLICANT, RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @RequirePermission("interview:cancel")
  public cancelInterview(
    @Param("interviewId") interviewId: string,
    @currentUser() user: JwtPayloadType,
    @Body() body: cancelInterviewDTO,
  ) {
    const cancelby =
      user.role === RoleUser.APPLICANT ? CancelBy.APPLICANT : CancelBy.COMPANY;

    return this.interviewService.cancelInterview(
      interviewId,
      body,
      cancelby,
      user.role === RoleUser.COMPANY ? user.id : undefined,
      user.role === RoleUser.APPLICANT ? user.id : undefined,
    );
  }

  @Get("applicant")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @RequirePermission("interview:get_all_by_applicant")
  public allInterviewByApplicant(@currentUser() user: JwtPayloadType) {
    return this.interviewService.getApplicantInterviews(user.id);
  }

  @Get("company/stats")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @RequirePermission("interview:get_stats_by_company")
  public interviewStatsWithCompany(@currentUser() user: JwtPayloadType) {
    return this.interviewService.getInterviewStatsWithCompany(user.id);
  }

  @Get("applicant/stats")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @RequirePermission("interview:get_stats_by_applicant")
  public interviewStatsWithApplicant(@currentUser() user: JwtPayloadType) {
    return this.interviewService.getInterviewStatsWithApplicant(user.id);
  }
}
