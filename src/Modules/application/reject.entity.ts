import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { JobApplicant } from "./job_applicant.entity";

@Entity("reject-cv")
export class Reject {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  reason: string;

  @CreateDateColumn({ type: "timestamptz"})
  createdAt: Date;

  @OneToOne(() => JobApplicant)
  @JoinColumn()
  application: JobApplicant;
}
