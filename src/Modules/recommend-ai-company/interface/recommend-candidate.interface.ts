export type CandidateRecommendation = {
  id: number;

  years_experience: number;

  features: {
    semantic_score: number;
    skill_overlap_score: number;
    experience_score: number;
  };

  final_score: number;
};
