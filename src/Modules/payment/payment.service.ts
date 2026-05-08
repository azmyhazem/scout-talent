import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePaymentDto } from "./dto/CreatePayment.dto";
import { Subscription } from "../subscription/subscription.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { Payment } from "./payment.entity";
import { PaymobService } from "src/Shared/paymob/paymob.service";
import { PaymentStatus } from "src/Shared/Enums/payment.enum";
import { SubscriptionService } from "../subscription/subscription.service";

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,

    private readonly paymobService: PaymobService,

    @Inject(forwardRef(() => SubscriptionService))
    private subscriptionService: SubscriptionService,
  ) {}

  createPayment(
    dto: CreatePaymentDto,
    subscription: Subscription,
    manager: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Payment)
      : this.paymentRepository;

    const payment = repo.create({ ...dto, subscription });
    return repo.save(payment);
  }

  addOrderId(id: string, paymobOrderId: string, manager: EntityManager) {
    const repo = manager
      ? manager.getRepository(Payment)
      : this.paymentRepository;

    return repo.update(id, { paymobOrderId });
  }

  async processWebhook(body: any, hmac: string) {
    const webhook = this.paymobService.handleWebhook(body, hmac);

    // get payment
    const payment = await this.paymentRepository.findOne({
      where: {
        paymobOrderId: webhook.orderId,
      },
      relations: ["subscription"],
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    // already processed
    if (payment.status === PaymentStatus.SUCCESS) {
      return { message: "Already processed" };
    }

    // payment success
    if (webhook.success) {
      payment.status = PaymentStatus.SUCCESS;

      payment.transactionId = webhook.orderId.toString();
      payment.paidAt= new Date()

      await this.paymentRepository.save(payment);

      await this.subscriptionService.updateSubStatusActive(
        payment.subscription.id,
      );
    }

    // payment failed
    else {
      payment.status = PaymentStatus.FAILED;

      await this.paymentRepository.save(payment);
    }

    return {
      success: true,
    };
  }
}
