import { Job } from "src/Modules/Job/job.entity";
import { RecommendationBatchCV } from "../recommendation-batch-cv.entity";

export class createRecommend {
  job: Job;
  batch: RecommendationBatchCV;

  final_score: number;
  similarity_score: number;
  skill_match_score: number;
  experience_match_score: number;
  seniority_match: number;

  matched_skills: string[];
  missing_skills: string[];
}
