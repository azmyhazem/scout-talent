import { Module } from "@nestjs/common";
import { InterviewService } from "./interview.service";
import { InterviewController } from "./interview.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Interview } from "./interviews.entity";
import { CancelInterview } from "./cancelInterview.entity";
import { FeedBack } from "./feedback.entity";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../Users/user.module";
import { JobApplicant } from "../application/job_applicant.entity";
import { ApplicationModule } from "../application/application.module";
import { NotificationModule } from "../notification/notification.module";
import { PlanFeaturePermission } from "../plan/plan-feature-permission.entity";
import { Subscription } from "../subscription/subscription.entity";
import { FeatureUsage } from "../features/feature-usage.entity";

@Module({
  providers: [InterviewService],
  controllers: [InterviewController],
  imports: [
    JwtModule,
    UserModule,
    ApplicationModule,
    NotificationModule,
    TypeOrmModule.forFeature([
      Interview,
      CancelInterview,
      FeedBack,
      JobApplicant,
      Subscription,
      PlanFeaturePermission,
      FeatureUsage,
    ]),
  ],
})
export class InterviewModule {}
