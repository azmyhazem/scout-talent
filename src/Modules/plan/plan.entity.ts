import { PlanStatus } from "src/Shared/Enums/plan.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("plans")
export class Plan {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("decimal")
  price: number;

  @Column()
  durationDays: number;

  @Column({ type: "enum", enum: PlanStatus, default: PlanStatus.DRAFT })
  status: PlanStatus;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
