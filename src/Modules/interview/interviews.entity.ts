import {
  InterviewStatus,
  InterviewTypes,
} from "src/Shared/Enums/Interview.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FeedBack } from "./feedback.entity";
import { CancelInterview } from "./cancelInterview.entity";
import { JobApplicant } from "../application/job_applicant.entity";

@Entity("interviews")
export class Interview {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "enum",
    enum: InterviewTypes,
    default: InterviewTypes.TECHNICAL,
  })
  type!: InterviewTypes;

  @Column({
    type: "enum",
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  status!: InterviewStatus;

  @Column({ type: "timestamptz" })
  scheduledAt!: Date;

  @Column()
  meetingLink!: string;

  @Column({ type: "int" })
  durationMin!: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @ManyToOne(() => JobApplicant, (application) => application.interviews)
  application!: JobApplicant;

  @OneToOne(() => FeedBack, (feedback) => feedback.interview)
  feedback!: FeedBack;

  @OneToOne(() => CancelInterview, (cancel) => cancel.interview)
  CancelInterview!: CancelInterview;
}
