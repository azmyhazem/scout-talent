export interface JobRecommendation {
  job_id: number;
  job_uuid: string;
  title: string;

  final_score: number;
  similarity_score: number;
  skill_match_score: number;
  experience_match_score: number;
  seniority_match: number;

  matched_skills: string[];
  missing_skills: string[];
}