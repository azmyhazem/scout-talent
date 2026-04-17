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

@Entity({ name: "recommend-jobs" })
@Unique(["asset", "candidate"])
export class RecommendJobs {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "jsonb" })
  recommends: JobRecommendation[];

  @Column({ type: "timestamptz" })
  generatedAt: Date;

  @OneToOne(() => Applicant)
  @JoinColumn()
  candidate: Applicant;

  @OneToOne(() => CV)
  @JoinColumn()
  asset: CV;
}
