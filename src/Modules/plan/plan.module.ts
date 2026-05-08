import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Plan } from "./plan.entity";
import { PlanService } from "./plan.service";
import { PlanController } from "./plan.controller";
import { PlanFeaturePermission } from "./plan-feature-permission.entity";
import { FeatureModule } from "../features/feature.module";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  providers: [PlanService],
  controllers: [PlanController],
  imports: [
    TypeOrmModule.forFeature([Plan, PlanFeaturePermission]),
    UserModule,
    JwtModule,
    FeatureModule,
  ],
  exports: [PlanService],
})
export class PlanModule {}
