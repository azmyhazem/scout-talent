import { Applicant } from "src/Modules/applicant/applicant.entity";
import { RecommendationBatchJob } from "../recommendation-batch-job.entity";

export class createRecommend {
  applicant!: Applicant;
  batch!: RecommendationBatchJob;

  years_experience!: number;

  semantic_score!: number;
  skill_overlap_score!: number;
  experience_score!: number;
  final_score!: number;
}
