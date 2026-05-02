import { Module } from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import { SubscriptionController } from "./subscription.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Subscription } from "./subscription.entity";
import { PlanModule } from "../plan/plan.module";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../Users/user.module";

@Module({
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    PlanModule,
    JwtModule,
    UserModule,
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
