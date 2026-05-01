import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { RecommendationBatchJob } from "./recommendation-batch-job.entity";
import { Applicant } from "../applicant/applicant.entity";

@Entity({ name: "recommend-candidates" })
export class RecommendCandidate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("float")
  semantic_score: number;

  @Column("float")
  skill_overlap_score: number;

  @Column("float")
  experience_score: number;

  @Column("float")
  final_score: number;

  @Column()
  years_experience: number;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @Column({ default: false })
  isInvit: boolean;

  @ManyToOne(() => RecommendationBatchJob, (batch) => batch.recommendation, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "batchId" })
  batch: RecommendationBatchJob;

  @ManyToOne(() => Applicant, (app) => app.recommendation, { eager: true })
  applicant: Applicant;
}
