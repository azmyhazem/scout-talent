import { BullModule } from "@nestjs/bullmq";
import { forwardRef, Module } from "@nestjs/common";
import { CVProcessor } from "./processors/upload-cv.processor";
import { HttpModule } from "@nestjs/axios";
import { CVModule } from "src/Modules/CV/cv.module";
import { ApplicantModule } from "src/Modules/applicant/applicant.module";
import { JobModule } from "src/Modules/Job/job.module";
import { JobProcessor } from "./processors/upload-job.processor";
import { AnalyzeMatchProcessor } from "./processors/analyze-match.processor";
import { ApplicationModule } from "src/Modules/application/application.module";
import { RecommendJobProcessor } from "./processors/recommend-job.processor";
import { RecommendAiModule } from "src/Modules/recommend-ai-cv/recommend-ai-cv.module";
import { RecommendAiJobModule } from "src/Modules/recommend-ai-company/recommend-ai-company.module";
import { RecommendCandidateProcessor } from "./processors/recommend-candidate.processor";
import { UpdateJobStatusProcessor } from "./processors/update-job-status.processor";

@Module({
  providers: [
    CVProcessor,
    JobProcessor,
    AnalyzeMatchProcessor,
    RecommendJobProcessor,
    RecommendCandidateProcessor,
    UpdateJobStatusProcessor
  ],
  imports: [
    BullModule.registerQueue({ name: "upload-cv" }),
    BullModule.registerQueue({ name: "upload-job" }),
    BullModule.registerQueue({ name: "update-job-status" }),
    BullModule.registerQueue({ name: "analyze-match" }),
    BullModule.registerQueue({ name: "recommend-jobs" }),
    BullModule.registerQueue({ name: "recommend-candidate" }),
    HttpModule,
    forwardRef(() => CVModule),
    ApplicantModule,
    forwardRef(() => JobModule),
    forwardRef(() => ApplicationModule),
    RecommendAiModule,
    RecommendAiJobModule
  ],
  exports: [BullModule],
})
export class QueueModule {}
