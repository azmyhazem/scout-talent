import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { RecommendCandidate } from "./recommend-candidate.entity";
import { Job } from "../Job/job.entity";

@Entity({ name: "recommendation-batch-job" })
export class RecommendationBatchJob {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: StatusAI,
    default: StatusAI.PENDING,
  })
  status: StatusAI;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @ManyToOne(() => Job, (job) => job.batches, {
    onDelete: "CASCADE",
  })
  job: Job;

  @OneToMany(() => RecommendCandidate, (recommend) => recommend.batch, {
    eager: true,
  })
  recommendation: RecommendCandidate[];
}
