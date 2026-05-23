import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Experience } from "./experience.entity";
import { ExperienceController } from "./experience.controller";
import { ExperienceService } from "./experience.service";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ApplicantModule } from "../applicant/applicant.module";
import { Subscription } from "../subscription/subscription.entity";
import { PlanFeaturePermission } from "../plan/plan-feature-permission.entity";
import { FeatureUsage } from "../features/feature-usage.entity";

@Module({
  controllers: [ExperienceController],
  providers: [ExperienceService],
  imports: [
    ApplicantModule,
    UserModule,
    JwtModule,
    TypeOrmModule.forFeature([
      Experience,
      Subscription,
      PlanFeaturePermission,
      FeatureUsage,
    ]),
  ],
})
export class ExperienceModule {}
