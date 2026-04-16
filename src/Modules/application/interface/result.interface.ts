interface ExperienceAnalysis {
  candidate_years_estimate: number;
  required_years_estimate: number;
  status: "underqualified" | "qualified" | "overqualified" | "unknown";
}

export interface AIResult {
  overall_score: number;
  matched_skills: string[];
  missing_skills: string[];
  extra_skills: string[];
  experience_analysis: ExperienceAnalysis;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  explanation: string;
}