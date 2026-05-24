import { forwardRef, Module } from "@nestjs/common";
import { PermissionService } from "./permission.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./permission.entity";
import { PermissionController } from "./permission.controller";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { Subscription } from "../subscription/subscription.entity";
import { PlanFeaturePermission } from "../plan/plan-feature-permission.entity";
import { FeatureUsage } from "../features/feature-usage.entity";

@Module({
  providers: [PermissionService],
  controllers: [PermissionController],
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      Subscription,
      PlanFeaturePermission,
      FeatureUsage,
    ]),
    forwardRef(()=>UserModule) ,
    JwtModule,
  ],
  exports: [PermissionService],
})
export class PermissionModule {}
