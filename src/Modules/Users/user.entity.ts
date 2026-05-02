import { RoleUser, UserStatus } from "src/Shared/Enums/user.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserToken } from "./user-token.entity";
import { Applicant } from "../applicant/applicant.entity";
import { Company } from "../company/company.entity";
import { Notification } from "../notification/notification.entity";
import { Subscription } from "../subscription/subscription.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  linkedIn_profile: string;

  @Column({ select: false, unique: true })
  slug: string;

  @Column({ type: "enum", enum: RoleUser, default: RoleUser.APPLICANT })
  role: RoleUser;

  @Column({ nullable: true, select: false })
  refreshToken: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isDelete: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createAt: Date;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.ONLINE })
  status: UserStatus;

  @Column({ default: false })
  isBanned: boolean;

  @OneToMany(() => UserToken, (token) => token.user)
  tokens: UserToken[];

  @OneToOne(() => Applicant)
  applicant: Applicant;

  @OneToOne(() => Company)
  company: Company;

  @OneToMany(() => Notification, (not) => not.user)
  notification: Notification[];

  @OneToMany(() => Subscription, (sub) => sub.user)
  subscriptions: Subscription[];
}
