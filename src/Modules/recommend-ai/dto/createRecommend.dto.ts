import { Applicant } from "src/Modules/applicant/applicant.entity";
import { JobRecommendation } from "../interface/recommend-job.interface";
import { CV } from "src/Modules/CV/cv.entity";

export class createRecommend {
  recommends: JobRecommendation[];

  candidate: Applicant;

  generatedAt: Date;

  asset: CV;
}
