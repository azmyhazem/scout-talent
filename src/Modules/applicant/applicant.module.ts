import { forwardRef, Module } from "@nestjs/common";
import { ApplicantService } from "./applicant.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Applicant } from "./applicant.entity";
import { JobApplicant } from "../application/job_applicant.entity";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ApplicantController } from "./applicant.controller";
import { CVModule } from "../CV/cv.module";
import { RecommendAiModule } from "../recommend-ai-cv/recommend-ai-cv.module";

@Module({
  providers: [ApplicantService],
  controllers: [ApplicantController],
  imports: [
    JwtModule,
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([Applicant, JobApplicant]),
    RecommendAiModule,
    forwardRef(() => CVModule),
  ],
  exports: [ApplicantService],
})
export class ApplicantModule {}
