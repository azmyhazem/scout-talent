import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  ParseBoolPipe,
  Patch,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApplicantService } from "./applicant.service";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { ApiSecurity } from "@nestjs/swagger";
import { currentUser } from "src/Shared/decorator/currentUser.decorator";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { updateApplicantDTO } from "./dto/updateApplicant.dto";
import type { Response } from "express";

@Controller("applicant")
export class ApplicantController {
  constructor(private applicantService: ApplicantService) {}

  @Get("")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async GetProfile(@currentUser() payload: JwtPayloadType) {
    const user = await this.applicantService.findApplicantwithDetails(
      payload.id,
    );
    return {
      data: user,
    };
  }

  @Get("basic_info")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async GetBasicInfo(@currentUser() payload: JwtPayloadType) {
    const user = await this.applicantService.basicInformation(payload.id);
    return {
      data: user,
    };
  }

  @Get("recommend/job")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async recommendJob(
    @currentUser() payload: JwtPayloadType,
    @Query("isRefresh", new DefaultValuePipe(false), ParseBoolPipe)
    isRefresh: boolean,
  ) {
    const result = await this.applicantService.getJobsRecommend(
      payload.id,
      isRefresh,
    );

    return result;
  }

  @Get("shared/profile")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async sharedProfile(@currentUser() payload: JwtPayloadType) {
    return this.applicantService.shareLink(payload.id);
  }

  @Patch("basic_info")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async updateBasicInfo(
    @currentUser() payload: JwtPayloadType,
    @Body() body: updateApplicantDTO,
  ) {
    await this.applicantService.updateProfile(body, payload.id);
    return {
      data: true,
    };
  }

  @Get("completion")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async profileCompleteUser(@currentUser() user: JwtPayloadType) {
    const data = await this.applicantService.profileCompleteUser(user.id);
    return {
      data,
    };
  }

  @Get("dashboard-stats")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async dashboardStatistics(@currentUser() user: JwtPayloadType) {
    const data = await this.applicantService.dashboardStatisticsUser(user.id);
    return { data };
  }

  @Delete("detele")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async deleteAccount(
    @currentUser() user: JwtPayloadType,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.applicantService.deleteAccount(user.id);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return { data };
  }
}
