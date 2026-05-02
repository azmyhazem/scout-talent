import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { User } from "src/Modules/Users/user.entity";
import { CV } from "src/Modules/CV/cv.entity";
import { Job } from "src/Modules/Job/job.entity";
import { Skill } from "src/Modules/Skills/skills.entity";
import { Experience } from "src/Modules/Experience/experience.entity";
import { HiredDetails } from "src/Modules/application/Hired_Details.entity";
import { Interview } from "src/Modules/interview/interviews.entity";
import { Reject } from "src/Modules/application/reject.entity";
import { FeedBack } from "src/Modules/interview/feedback.entity";
import { Outbox } from "src/Modules/Users/outbox.entity";
import { UserToken } from "src/Modules/Users/user-token.entity";
import { CancelInterview } from "src/Modules/interview/cancelInterview.entity";
import { JobApplicant } from "src/Modules/application/job_applicant.entity";
import { JobOffer } from "src/Modules/application/jobOffer.entity";
import { Applicant } from "src/Modules/applicant/applicant.entity";
import { Company } from "src/Modules/company/company.entity";
import { Specialization } from "src/Modules/specialization/specialization.entity";
import { Industry } from "src/Modules/industry/industry.entity";
import { RecommendJobs } from "src/Modules/recommend-ai-cv/recommend-job.entity";
import { RecommendCandidate } from "src/Modules/recommend-ai-company/recommend-candidate.entity";
import { RecommendationBatchCV } from "src/Modules/recommend-ai-cv/recommendation-batch-cv.entity";
import { RecommendationBatchJob } from "src/Modules/recommend-ai-company/recommendation-batch-job.entity";
import { Notification } from "src/Modules/notification/notification.entity";
import { Plan } from "src/Modules/plan/plan.entity";
import { Subscription } from "src/Modules/subscription/subscription.entity";

config({ path: ".env" });

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  url: process.env.DB_URL,
  synchronize: false,
  entities: [
    User,
    Applicant,
    Company,
    Industry,
    Specialization,
    UserToken,
    Outbox,
    CV,
    Job,
    JobApplicant,
    Skill,
    Experience,
    HiredDetails,
    Interview,
    JobOffer,
    Reject,
    FeedBack,
    CancelInterview,
    RecommendJobs,
    RecommendCandidate,
    RecommendationBatchCV,
    RecommendationBatchJob,
    Notification,
    Plan,
    Subscription,
  ],
  migrations: ["dist/db/migrations/*.js"],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
