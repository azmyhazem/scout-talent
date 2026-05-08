import { Module } from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import { SubscriptionController } from "./subscription.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Subscription } from "./subscription.entity";
import { PlanModule } from "../plan/plan.module";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../Users/user.module";
import { PaymobModule } from "src/Shared/paymob/paymob.module";
import { PaymentModule } from "../payment/payment.module";

@Module({
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    PlanModule,
    JwtModule,
    UserModule,
    PaymobModule,
    PaymentModule
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
