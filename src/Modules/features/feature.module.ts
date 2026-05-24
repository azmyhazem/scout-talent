import { forwardRef, Module } from "@nestjs/common";
import { FeatureService } from "./feature.service";
import { FeaturesController } from "./feature.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Feature } from "./feature.entity";
import { FeaturePermission } from "./feature-permissions.entity";
import { PermissionModule } from "../permission/permission.module";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { FeatureUsage } from "./feature-usage.entity";

@Module({
  providers: [FeatureService],
  controllers: [FeaturesController],
  imports: [
    TypeOrmModule.forFeature([Feature, FeaturePermission, FeatureUsage]),
    forwardRef(()=>PermissionModule) ,
    forwardRef(()=>UserModule),
    JwtModule,
  ],
  exports: [FeatureService],
})
export class FeatureModule {}
