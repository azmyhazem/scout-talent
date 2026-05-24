import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Plan } from "./plan.entity";
import { FeaturePermission } from "../features/feature-permissions.entity";
import { FeatureUsage } from "../features/feature-usage.entity";

@Entity("plan_feature_permissions")
export class PlanFeaturePermission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "integer", nullable: true })
  limitCount: number | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Plan, (plan) => plan.planFeaturePermissions, {
    onDelete: "CASCADE",
  })
  plan: Plan;

  @ManyToOne(() => FeaturePermission, (fp) => fp.planFeaturePermissions, {
    onDelete: "CASCADE",
  })
  featurePermission: FeaturePermission;

  @OneToMany(() => FeatureUsage, (fu) => fu.planFeaturePermission)
  featureUsages: FeatureUsage[];
}
