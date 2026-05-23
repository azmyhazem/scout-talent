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
import { JobModule } from "../Job/job.module";
import { QueueModule } from "src/queue/queue.module";
import { Subscription } from "../subscription/subscription.entity";
import { PlanFeaturePermission } from "../plan/plan-feature-permission.entity";
import { FeatureUsage } from "../features/feature-usage.entity";

@Module({
  providers: [ApplicantService],
  controllers: [ApplicantController],
  imports: [
    JwtModule,
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([
      Applicant,
      JobApplicant,
      Subscription,
      PlanFeaturePermission,
      FeatureUsage,
    ]),
    RecommendAiModule,
    forwardRef(() => CVModule),
    forwardRef(() => JobModule),
    forwardRef(() => QueueModule),
  ],
  exports: [ApplicantService],
})
export class ApplicantModule {}
