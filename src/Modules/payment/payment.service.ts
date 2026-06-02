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
      payment.paidAt = new Date();

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

  async getPayments(
    page: number,
    limit: number,
    search?: string,
    status?: string,
  ) {
    const queryBuilder = this.paymentRepository.createQueryBuilder("payment");

    if (search) {
      queryBuilder.andWhere(
        `(payment.name ILIKE :search
          OR payment.email ILIKE :search
          OR payment.plan ILIKE :search)`,
        {
          search: `%${search}%`,
        },
      );
    }

    if (status) {
      queryBuilder.andWhere("payment.status = :status", { status });
    }

    queryBuilder
      .orderBy("payment.date", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getPaymentStats() {
    const [totalRevenueResult, transactions, failed, pending] =
      await Promise.all([
        this.paymentRepository
          .createQueryBuilder("payment")
          .select("COALESCE(SUM(payment.amount), 0)", "totalRevenue")
          .where("payment.status = :status", {
            status: PaymentStatus.SUCCESS,
          })
          .getRawOne(),

        this.paymentRepository.count(),

        this.paymentRepository.count({
          where: {
            status: PaymentStatus.FAILED,
          },
        }),

        this.paymentRepository.count({
          where: {
            status: PaymentStatus.PENDING,
          },
        }),
      ]);

    return {
      success: true,
      data: {
        totalRevenue: Number(totalRevenueResult.totalRevenue),
        transactions,
        failed,
        pending,
      },
    };
  }

  async getPaymentById(paymentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: {
        id: paymentId,
      },
      relations: {
        subscription: {
          user: true,
        },
      },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    return {
      success: true,
      data: payment,
    };
  }

}
