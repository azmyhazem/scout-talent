import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { RecommendationBatchCV } from "./recommendation-batch-cv.entity";
import { Job } from "../Job/job.entity";

@Entity({ name: "recommend-jobs" })
export class RecommendJobs {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("float")
  final_score: number;

  @Column("float")
  similarity_score: number;

  @Column("float")
  skill_match_score: number;

  @Column("float")
  experience_match_score: number;

  @Column("float")
  seniority_match: number;

  // 🔥 Arrays (skills)
  @Column("simple-array", { nullable: true })
  matched_skills: string[];

  @Column("simple-array", { nullable: true })
  missing_skills: string[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @ManyToOne(() => RecommendationBatchCV, (batch) => batch.recommendation, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "batchId" })
  batch: RecommendationBatchCV;

  @ManyToOne(() => Job, (job) => job.recommendation, { eager: true })
  job: Job;
}
