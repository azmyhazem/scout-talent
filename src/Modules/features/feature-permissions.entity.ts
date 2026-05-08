import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Feature } from './feature.entity';
import { Permission } from '../permission/permission.entity';
import { PlanFeaturePermission } from '../plan/plan-feature-permission.entity';
import { FeatureUsage } from './feature-usage.entity';


@Entity('feature_permissions')
export class FeaturePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Feature, (feature) => feature.featurePermissions, {
    onDelete: 'CASCADE',
  })
  feature: Feature;

  @ManyToOne(() => Permission, (permission) => permission.featurePermissions, {
    onDelete: 'CASCADE',
  })
  permission: Permission;

  @OneToMany(() => PlanFeaturePermission, (pfp) => pfp.featurePermission)
  planFeaturePermissions: PlanFeaturePermission[];

  @OneToMany(() => FeatureUsage, (fu) => fu.featurePermission)
  featureUsages: FeatureUsage[];
}