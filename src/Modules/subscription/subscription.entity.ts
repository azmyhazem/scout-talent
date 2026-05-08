import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "../Users/user.entity";
import { Plan } from "../plan/plan.entity";
import { Payment } from "../payment/payment.entity";
import { FeatureUsage } from "../features/feature-usage.entity";
import { SubscriptionStatus } from "src/Shared/Enums/subscription.enum";

@Entity("subscriptions")
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @Column({ name: "start_date", type: "date" })
  startDate: Date | null;

  @Column({ name: "end_date", type: "date", nullable: true })
  endDate: Date | null;

  @Column({ name: "auto_renew", type: "boolean", default: true })
  autoRenew: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions, { onDelete: "RESTRICT" })
  plan: Plan;

  @OneToMany(() => Payment, (payment) => payment.subscription)
  payments: Payment[];

  @OneToMany(() => FeatureUsage, (fu) => fu.subscription)
  featureUsages: FeatureUsage[];
}
