import { Module } from "@nestjs/common";
import { SpecializationService } from "./specialization.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Specialization } from "./specialization.entity";
import { SpecializationController } from "./specialization.controller";
import { CompanyModule } from "../company/company.module";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../Users/user.module";
import { Subscription } from "../subscription/subscription.entity";
import { PlanFeaturePermission } from "../plan/plan-feature-permission.entity";
import { FeatureUsage } from "../features/feature-usage.entity";

@Module({
  providers: [SpecializationService],
  controllers: [SpecializationController],
  imports: [
    JwtModule,
    UserModule,
    CompanyModule,
    TypeOrmModule.forFeature([
      Specialization,
      Subscription,
      PlanFeaturePermission,
      FeatureUsage,
    ]),
  ],
})
export class SpecializationModule {}
