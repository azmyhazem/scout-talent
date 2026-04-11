import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { JobApplicant } from "./job_applicant.entity";

@Entity("hiredDetails")
export class HiredDetails {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "timestamptz" })
  startDate: Date;

  @CreateDateColumn({ type: "timestamptz"})
  createdAt: Date;

  @OneToOne(() => JobApplicant)
  @JoinColumn()
  application: JobApplicant;
}
