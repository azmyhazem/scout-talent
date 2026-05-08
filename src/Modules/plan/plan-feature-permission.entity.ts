import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Plan } from './plan.entity';
import { FeaturePermission } from '../features/feature-permissions.entity';

@Entity('plan_feature_permissions')
export class PlanFeaturePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'limit_count', type: 'integer', nullable: true })
  limitCount: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Plan, (plan) => plan.planFeaturePermissions, {
    onDelete: 'CASCADE',
  })
  plan: Plan;

  @ManyToOne(
    () => FeaturePermission,
    (fp) => fp.planFeaturePermissions,
    { onDelete: 'CASCADE' },
  )
  featurePermission: FeaturePermission;
}