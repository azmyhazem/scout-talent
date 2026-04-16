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

@Module({
  providers: [CVProcessor, JobProcessor, AnalyzeMatchProcessor],
  imports: [
    BullModule.registerQueue({ name: "upload-cv" }),
    BullModule.registerQueue({ name: "upload-job" }),
    BullModule.registerQueue({ name: "analyze-match" }),
    HttpModule,
    forwardRef(() => CVModule),
    ApplicantModule,
    forwardRef(() => JobModule),
    forwardRef(() => ApplicationModule),
  ],
  exports: [BullModule],
})
export class QueueModule {}
