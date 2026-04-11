import { CancelBy } from "src/Shared/Enums/interviewCancel.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Interview } from "./interviews.entity";

@Entity("cancel-interview")
export class CancelInterview {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  reason: string;

  @Column({
    type: "enum",
    enum: CancelBy,
  })
  cancelBy: CancelBy;

  @CreateDateColumn({ type: "timestamptz"})
  createdAt: Date;

  @OneToOne(() => Interview)
  @JoinColumn()
  interview: Interview;
}
