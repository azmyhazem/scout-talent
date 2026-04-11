import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
  Unique,
} from "typeorm";
import { CandidateStatus } from "src/Shared/Enums/candidateStatus.enum";
import { CV } from "../CV/cv.entity";
import { Job } from "../Job/job.entity";
import { HiredDetails } from "./Hired_Details.entity";
import { JobOffer } from "./jobOffer.entity";
import { Interview } from "../interview/interviews.entity";
import { Reject } from "./reject.entity";
import { Applicant } from "../applicant/applicant.entity";

@Entity({ name: "job_applicant" })
@Unique(["job", "applicant"])
export class JobApplicant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "enum", enum: CandidateStatus, default: CandidateStatus.NEW })
  status!: CandidateStatus;

  @Column()
  about!: string;

  @ManyToOne(() => Job, (job) => job.applications)
  job!: Job;

  @ManyToOne(() => Applicant, (app) => app.Applicantion)
  applicant!: Applicant;

  @ManyToOne(() => CV)
  @JoinColumn()
  cv!: CV;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @OneToOne(() => HiredDetails, (details) => details.application)
  hiredDetails!: HiredDetails;

  @Column({ type: "timestamptz", nullable: true, default: null })
  hiredAt!: Date;

  @Column({ type: "timestamptz", nullable: true, default: null })
  screenAt!: Date;

  @OneToOne(() => JobOffer, (offer) => offer.application)
  offer!: JobOffer;

  @Column({ type: "timestamptz", nullable: true, default: null })
  sendOfferAt!: Date;

  @OneToMany(() => Interview, (interview) => interview.application)
  interviews!: Interview[];

  @Column({ type: "timestamptz", nullable: true, default: null })
  interviewAt!: Date;

  @OneToOne(() => Reject, (reject) => reject.application)
  reject!: Reject;

  @Column({ type: "timestamptz", nullable: true, default: null })
  rejectAt!: Date;
}
