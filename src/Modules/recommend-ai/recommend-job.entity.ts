import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Applicant } from "../applicant/applicant.entity";
import { CV } from "../CV/cv.entity";
import type { JobRecommendation } from "./interface/recommend-job.interface";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";

@Entity({ name: "recommend-jobs" })
@Unique(["asset", "candidate"])
export class RecommendJobs {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "jsonb" })
  recommends: JobRecommendation[];

  @Column({ type: "timestamptz" })
  generatedAt: Date;

  @Column({ type: "enum", enum: StatusAI, default: StatusAI.PENDING })
  status: StatusAI;

  @OneToOne(() => Applicant)
  @JoinColumn()
  candidate: Applicant;

  @OneToOne(() => CV)
  @JoinColumn()
  asset: CV;
}
