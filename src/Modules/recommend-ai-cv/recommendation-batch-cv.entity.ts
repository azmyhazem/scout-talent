import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CV } from "../CV/cv.entity";
import { RecommendJobs } from "./recommend-job.entity";

@Entity({ name: "recommendation-batch-cv" })
export class RecommendationBatchCV {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: StatusAI,
    default: StatusAI.PENDING,
  })
  status: StatusAI;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => CV, (cv) => cv.batches, {
    onDelete: "CASCADE",
  })
  cv: CV;

  @OneToMany(() => RecommendJobs, (recommend) => recommend.batch, {
    eager: true,
  })
  recommendation: RecommendJobs[];
}
