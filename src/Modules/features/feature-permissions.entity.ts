import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Feature } from './feature.entity';
import { Permission } from '../permission/permission.entity';
import { PlanFeaturePermission } from '../plan/plan-feature-permission.entity';

@Entity('feature_permissions')
export class FeaturePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: "timestamptz" })
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

}