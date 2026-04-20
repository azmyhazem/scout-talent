import { Module } from "@nestjs/common";
import { RecommendAiService } from "./recommend-ai-cv.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RecommendJobs } from "./recommend-job.entity";
import { RecommendationBatchCV } from "./recommendation-batch-cv.entity";

@Module({
  providers: [RecommendAiService],
  imports: [
    TypeOrmModule.forFeature([
      RecommendJobs,
      RecommendationBatchCV,
    ]),
  ],
  exports: [RecommendAiService],
})
export class RecommendAiModule {}
