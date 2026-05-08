import { Controller, Post, Body, Query } from "@nestjs/common";
import { PaymentService } from "./payment.service";

@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("webhook")
  handleWebhook(@Body() body: any, @Query("hmac") hmac: string) {
    return this.paymentService.processWebhook(body, hmac);
  }
}
