import { forwardRef, Module } from "@nestjs/common";
import { CompanyService } from "./company.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Company } from "./company.entity";
import { JobApplicant } from "../application/job_applicant.entity";
import { UserModule } from "../Users/user.module";
import { JobModule } from "../Job/job.module";
import { CompanyController } from "./company.controller";
import { JwtModule } from "@nestjs/jwt";
import { Subscription } from "../subscription/subscription.entity";
import { PlanFeaturePermission } from "../plan/plan-feature-permission.entity";
import { FeatureUsage } from "../features/feature-usage.entity";

@Module({
  controllers: [CompanyController],
  providers: [CompanyService],

  exports: [CompanyService],
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => JobModule),
    JwtModule,
    TypeOrmModule.forFeature([
      Company,
      JobApplicant,
      Subscription,
      PlanFeaturePermission,
      FeatureUsage,
    ]),
  ],
})
export class CompanyModule {}
