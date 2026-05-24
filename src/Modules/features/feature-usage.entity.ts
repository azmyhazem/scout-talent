import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Subscription } from '../subscription/subscription.entity';
import { PlanFeaturePermission } from '../plan/plan-feature-permission.entity';

@Entity('feature_usage')
export class FeatureUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', default: 0 })
  usedCount: number;

  @Column({ type: 'date' })
  periodStart: Date;

  @Column({ type: 'date' })
  periodEnd: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Subscription, (subscription) => subscription.featureUsages, {
    onDelete: 'CASCADE',
  })
  subscription: Subscription;

  @ManyToOne(
    () => PlanFeaturePermission,
    (fp) => fp.featureUsages,
    { onDelete: 'CASCADE' },
  )
  planFeaturePermission: PlanFeaturePermission;
}