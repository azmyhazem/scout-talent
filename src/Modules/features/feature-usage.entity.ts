import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Subscription } from '../subscription/subscription.entity';
import { FeaturePermission } from './feature-permissions.entity';


@Entity('feature_usage')
export class FeatureUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'used_count', type: 'bigint', default: 0 })
  usedCount: number;

  @Column({ name: 'period_start', type: 'date' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd: Date;

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Subscription, (subscription) => subscription.featureUsages, {
    onDelete: 'CASCADE',
  })
  subscription: Subscription;

  @ManyToOne(
    () => FeaturePermission,
    (fp) => fp.featureUsages,
    { onDelete: 'CASCADE' },
  )
  featurePermission: FeaturePermission;
}