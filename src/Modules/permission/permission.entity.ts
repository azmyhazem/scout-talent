import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { FeaturePermission } from '../features/feature-permissions.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar' })
  method:string

  @CreateDateColumn({ name: 'created_at', type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: "timestamptz" })
  updatedAt: Date;

  @OneToMany(
    () => FeaturePermission,
    (featurePermission) => featurePermission.permission,
  )
  featurePermissions: FeaturePermission[];
}