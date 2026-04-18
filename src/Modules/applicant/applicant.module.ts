import { forwardRef, Module } from "@nestjs/common";
import { ApplicantService } from "./applicant.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Applicant } from "./applicant.entity";
import { JobApplicant } from "../application/job_applicant.entity";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ApplicantController } from "./applicant.controller";
import { RecommendAiModule } from "../recommend-ai/recommend-ai.module";
import { CVModule } from "../CV/cv.module";
import { JobModule } from "../Job/job.module";

@Module({
  providers: [ApplicantService],
  controllers: [ApplicantController],
  imports: [
    JwtModule,
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([Applicant, JobApplicant]),
    RecommendAiModule,
    forwardRef(() => CVModule),
    forwardRef(() => JobModule),
  ],
  exports: [ApplicantService],
})
export class ApplicantModule {}
