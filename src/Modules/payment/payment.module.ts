import { forwardRef, Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymobModule } from "src/Shared/paymob/paymob.module";
import { PaymentService } from "./payment.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "./payment.entity";
import { SubscriptionModule } from "../subscription/subscription.module";

@Module({
  providers: [PaymentService],
  controllers: [PaymentController],
  imports: [
    PaymobModule,
    forwardRef(() => SubscriptionModule),
    TypeOrmModule.forFeature([Payment]),
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
