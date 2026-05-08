import { Module } from "@nestjs/common";
import { PermissionService } from "./permission.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./permission.entity";
import { PermissionController } from "./permission.controller";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  providers: [PermissionService],
  controllers: [PermissionController],
  imports: [TypeOrmModule.forFeature([Permission]), UserModule, JwtModule],
  exports: [PermissionService],
})
export class PermissionModule {}
