import { forwardRef, Module } from "@nestjs/common";
import { NotificationGateway } from "./notification.gateway";
import { NotificationService } from "./notification.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./notification.entity";
import { JwtModule } from "@nestjs/jwt";
import { NotificationController } from "./notification.controller";
import { UserModule } from "../Users/user.module";
import { RedisService } from "./redis.service";

@Module({
  providers: [NotificationGateway, NotificationService, RedisService],
  imports: [TypeOrmModule.forFeature([Notification]), 
  forwardRef(()=>UserModule),JwtModule ],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
