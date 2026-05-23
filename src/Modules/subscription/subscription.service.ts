import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Subscription } from "./subscription.entity";
import { DataSource, EntityManager, Repository } from "typeorm";
import { PlanService } from "../plan/plan.service";
import { SubscriptionStatus } from "src/Shared/Enums/subscription.enum";
import { PaymentService } from "../payment/payment.service";
import { PaymentMethod } from "src/Shared/Enums/payment.enum";
import { PaymobService } from "src/Shared/paymob/paymob.service";
import { UserService } from "../Users/user.service";
import { Plan } from "../plan/plan.entity";
import { User } from "../Users/user.entity";

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,

    private planService: PlanService,

    private paymentService: PaymentService,

    private paymobService: PaymobService,

    private userService: UserService,

    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  public async createSubscription(planId: string, userId: string) {
    // 1- get plan
    const plan = await this.planService.getPlanById(planId);

    if (!plan) {
      throw new BadRequestException("Plan not found");
    }

    // 2- get user
    const user = await this.userService.findUser(userId);

    if (!user) {
      throw new BadRequestException("User not found");
    }

    // 3- prepare dates
    const startDate = new Date();

    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationInDays);

    return this.dataSource.transaction(async (manager) => {
      const subscription = await this.createSub(
        plan,
        user,
        startDate,
        endDate,
        manager,
      );

      const payment = await this.paymentService.createPayment(
        {
          amount: plan.price,
          currency: plan.currency,
          method: PaymentMethod.CARD,
        },
        subscription,
        manager,
      );

      const billingData = {
        first_name: user.name,
        last_name: "NA",
        email: user.email,
        phone_number: "01000000000",

        apartment: "NA",
        floor: "NA",
        street: "NA",
        building: "NA",
        city: "Cairo",
        country: "EG",
        state: "Cairo",
        postal_code: "12345",
      };

      const paymobPayment = await this.paymobService.initiatePayment({
        amountCents: plan.price * 100,
        billingData,
      });

      await this.paymentService.addOrderId(
        payment.id,
        paymobPayment.orderId,
        manager,
      );

      return {
        data: {
          subscription,
          paymentUrl: paymobPayment.iframeUrl,
        },
      };
    });
  }

  public async updateSubStatusActive(subId: string) {
    return this.subscriptionRepository.update(
      { id: subId },
      { status: SubscriptionStatus.ACTIVE },
    );
  }

  public async countSubscription() {
    return this.subscriptionRepository.count();
  }

  public async countEnterpriseSubscribers() {
    const count = await this.subscriptionRepository
      .createQueryBuilder("sub")
      .leftJoin("sub.plan", "plan")
      .where("plan.name = :name", { name: "Enterprise" })
      .getCount();

    return count;
  }

  public async countProSubscribers() {
    return this.subscriptionRepository.count({
      where: { plan: { name: "Pro" } },
    });
  }

  public async mrr() {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    );

    return this.subscriptionRepository
      .createQueryBuilder("sub")
      .where("sub.createdAt BETWEEN :start AND :end", {
        start: startOfMonth,
        end: endOfMonth,
      })
      .getCount();
  }

  public allSubscription() {
    return this.subscriptionRepository.count();
  }

  async createDefaultSubscription(
    user: User,
    manager?: EntityManager,
  ): Promise<Subscription> {
    const repo = manager
      ? manager.getRepository(Subscription)
      : this.subscriptionRepository;
    const defaultPlan = await this.planService.getPlanDefault();

    if (!defaultPlan) {
      throw new NotFoundException(
        "No default plan found. Please set is_default = true on one plan.",
      );
    }

    const startDate = new Date();

    const endDate = new Date();
    endDate.setDate(startDate.getDate() + defaultPlan.durationInDays);

    const subscription = repo.create({
      user,
      plan: defaultPlan,
      endDate,
      startDate,
      status: SubscriptionStatus.ACTIVE,
    });

    return repo.save(subscription);
  }

  private createSub(
    plan: Plan,
    user: User,
    startDate: Date,
    endDate: Date,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Subscription)
      : this.subscriptionRepository;

    return repo.save(
      repo.create({
        plan,
        user,
        status: SubscriptionStatus.PENDING,
        startDate,
        endDate,
      }),
    );
  }
}
