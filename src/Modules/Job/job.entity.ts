import { JobStatus, WorkMode, JobType } from "src/Shared/Enums/job.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { JobApplicant } from "../application/job_applicant.entity";
import { Company } from "../company/company.entity";
import { Seniority } from "src/Shared/Enums/seniority.enum";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import { RecommendJobs } from "../recommend-ai-cv/recommend-job.entity";
import { Industry } from "../industry/industry.entity";
import {
  RecommendationBatchJob,
} from "../recommend-ai-company/recommendation-batch-job.entity";

@Entity({ name: "jobs" })
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  location: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  minSalary: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  maxSalary: number;

  // 📌 Type & Status
  @Column({ type: "enum", enum: JobType })
  type: JobType;

  @Column({ type: "enum", enum: JobStatus, default: JobStatus.DRAFT })
  status: JobStatus;

  @Column({ type: "enum", enum: WorkMode })
  workMode: WorkMode;

  @Column({ type: "enum", enum: Seniority })
  seniority: Seniority;

  @Column({ nullable: true })
  jobIdAi: string;

  @Column({ type: "enum", enum: StatusAI, default: StatusAI.PENDING })
  statusAi: StatusAI;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "int" })
  positions: number;

  @Column({ type: "int", nullable: true })
  maxApplications: number;

  @Column({ default: 0 })
  applicationsCount: number;

  @Column({ default: 0 })
  acceptedCount: number;

  @Column({ type: "timestamptz" })
  deadline: Date;

  @Column("simple-array", { nullable: true })
  skills: string[];

  @Column("simple-array", { nullable: true })
  responsibilities: string[];

  @Column()
  requirements: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
  })
  updatedAt: Date;

  @ManyToOne(() => Company, (com) => com.jobs, { eager: true })
  company: Company;

  @ManyToOne(() => Industry, (ind) => ind.applicant)
  industry!: Industry;

  @OneToMany(() => JobApplicant, (jobApplicant) => jobApplicant.job)
  applications: JobApplicant[];

  @OneToMany(() => RecommendJobs, (rec) => rec.job)
  recommendation: RecommendJobs[];

  @OneToMany(() => RecommendationBatchJob, (rec) => rec.job)
  batches: RecommendationBatchJob[];
}
