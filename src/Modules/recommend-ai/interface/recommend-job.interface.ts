export interface JobRecommendation {
  job_id: number;
  title: string;

  final_score: number;

  matched_skills: string[];
  missing_skills: string[];
}