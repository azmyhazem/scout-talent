import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { ApiQuery, ApiSecurity } from "@nestjs/swagger";
import { CandidateStatus } from "src/Shared/Enums/candidateStatus.enum";
import { currentUser } from "src/Shared/decorator/currentUser.decorator";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { ApplicationService } from "./application.service";
import { RejectDTO } from "./dto/reject.dto";
import { HiredDTO } from "./dto/hired.dto";
import { InterviewDTO } from "./dto/interview.dto";
import { JobType, WorkMode } from "src/Shared/Enums/job.enum";
import { applyJobDTO } from "./dto/applyJob.dto";

@Controller("candidate")
export class CandidateController {
  constructor(private applicationService: ApplicationService) {}

  @Post("applyJob/:jobId/:cvId")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async applyJob(
    @currentUser() user: JwtPayloadType,
    @Param("jobId") jobId: string,
    @Param("cvId") cvId: string,
    @Body() body: applyJobDTO,
  ) {
    const data = await this.applicationService.applyJob(
      user.id,
      jobId,
      cvId,
      body,
    );
    return { data };
  }

  @Get("company/jobsApply")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @ApiQuery({ name: "q", required: false, type: String })
  @ApiQuery({ name: "s", required: false, enum: CandidateStatus })
  public async GetAllJobsByCompanyApply(
    @currentUser() company: JwtPayloadType,
    @Query("q") q?: string,
    @Query("s") status?: CandidateStatus,
  ) {
    const data = await this.applicationService.GetAllJobsByCompanyApply(
      company.id,
      q,
      status,
    );
    return { data };
  }

  @Get("company/jobsApply/:id")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @ApiQuery({ name: "q", required: false, type: String })
  @ApiQuery({ name: "s", required: false, enum: CandidateStatus })
  public async GetJobByCompanyApplyById(
    @currentUser() company: JwtPayloadType,
    @Param("id") id: string,
  ) {
    const data = await this.applicationService.GetJobByCompanyApplyById(
      company.id,
      id,
    );

    return { data };
  }

  @Get("screening/:id")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async screenCV(
    @currentUser() company: JwtPayloadType,
    @Param("id") id: string,
  ) {
    const data = await this.applicationService.screeningCV(company.id, id);
    return { data };
  }

  @Post("reject/:id")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async rejectedCV(
    @currentUser() company: JwtPayloadType,
    @Param("id") id: string,
    @Body() body: RejectDTO,
  ) {
    const data = await this.applicationService.rejectCV(company.id, id, body);
    return { data };
  }

  @Post("hire/:id")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async hiredCV(
    @currentUser() company: JwtPayloadType,
    @Param("id") id: string,
    @Body() body: HiredDTO,
  ) {
    const data = await this.applicationService.hiredCV(company.id, id, body);
    return { data };
  }

  @Post("interview/:id")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async interviewCV(
    @currentUser() company: JwtPayloadType,
    @Param("id") id: string,
    @Body() body: InterviewDTO,
  ) {
    const data = await this.applicationService.interviewCV(
      company.id,
      id,
      body,
    );
    return { data };
  }

  @Get("applicant/jobsApply")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "location", required: false, type: String })
  @ApiQuery({ name: "jobType", required: false, enum: JobType })
  @ApiQuery({ name: "workMode", required: false, enum: WorkMode })
  public async applicantJobByApplicant(
    @currentUser() user: JwtPayloadType,
    @Query("search") search?: string,
    @Query("location") location?: string,
    @Query("jobType") jobType?: JobType,
    @Query("workMode") workMode?: WorkMode,
  ) {
    const jobApply =
      await this.applicationService.alljobsApplicantionByApplicant(
        user.id,
        search,
        location,
        jobType,
        workMode,
      );
    return {
      data: jobApply,
    };
  }

  @Get("applicant/jobsApply/:id")
  @Roles(RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async applicantJobByApplicantByID(
    @currentUser() user: JwtPayloadType,
    @Param("id") id: string,
  ) {
    const jobApply =
      await this.applicationService.jobApplicantionByApplicantByID(user.id, id);

    return {
      data: jobApply,
    };
  }
}
