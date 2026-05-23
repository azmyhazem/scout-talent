import { Module } from "@nestjs/common";
import { SkillController } from "./skills.controller";
import { SkillService } from "./skills.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Skill } from "./skills.entity";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ApplicantModule } from "../applicant/applicant.module";
import { Subscription } from "../subscription/subscription.entity";
import { PlanFeaturePermission } from "../plan/plan-feature-permission.entity";
import { FeatureUsage } from "../features/feature-usage.entity";

@Module({
  controllers: [SkillController],
  providers: [SkillService],
  imports: [
    ApplicantModule,
    UserModule,
    JwtModule,
    TypeOrmModule.forFeature([
      Skill,
      Subscription,
      PlanFeaturePermission,
      FeatureUsage,
    ]),
  ],
})
export class SkillModule {}
