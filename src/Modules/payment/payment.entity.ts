import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { Subscription } from "../subscription/subscription.entity";
import { PaymentMethod, PaymentStatus } from "src/Shared/Enums/payment.enum";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ type: "varchar" })
  currency: string;

  @Index()
  @Column({ name: "paymob_order_id", type: "int", nullable: true })
  paymobOrderId: string | null;

  @Column({
    name: "paymob_transaction_id",
    type: "varchar",
    nullable: true,
  })
  transactionId: string | null;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: "paid_at", type: "timestamp", nullable: true })
  paidAt: Date | null;

  @Column({ type: "enum", enum: PaymentMethod })
  method: PaymentMethod;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Subscription, (subscription) => subscription.payments, {
    onDelete: "CASCADE",
  })
  subscription: Subscription;
}
