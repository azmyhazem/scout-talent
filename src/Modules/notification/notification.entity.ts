import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../Users/user.entity";
import {
  NotificationTitleMap,
  NotificationType,
} from "src/Shared/Enums/notification.enum";

@Entity({ name: "notification" })
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: "jsonb", nullable: true })
  meta: Record<string, any>;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.notification)
  user: User;

  @BeforeInsert()
  setTitle() {
    this.title = NotificationTitleMap[this.type];
  }
}
