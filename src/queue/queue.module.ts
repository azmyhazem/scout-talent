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
import { RecommendAiModule } from "src/Modules/recommend-ai/recommend-ai.module";
import { RecommendJobProcessor } from "./processors/recommend-job.processor";

@Module({
  providers: [
    CVProcessor,
    JobProcessor,
    AnalyzeMatchProcessor,
    RecommendJobProcessor,
  ],
  imports: [
    BullModule.registerQueue({ name: "upload-cv" }),
    BullModule.registerQueue({ name: "upload-job" }),
    BullModule.registerQueue({ name: "analyze-match" }),
    BullModule.registerQueue({ name: "recommend-jobs" }),
    HttpModule,
    forwardRef(() => CVModule),
    ApplicantModule,
    forwardRef(() => JobModule),
    forwardRef(() => ApplicationModule),
    RecommendAiModule,
  ],
  exports: [BullModule],
})
export class QueueModule {}
