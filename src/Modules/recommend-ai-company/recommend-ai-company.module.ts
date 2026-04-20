import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RecommendCandidate } from "./recommend-candidate.entity";
import { RecommendationBatchJob } from "./recommendation-batch-job.entity";
import { RecommendJobService } from "./recommend-job.service";

@Module({
  providers: [RecommendJobService],
  imports: [
    TypeOrmModule.forFeature([RecommendCandidate, RecommendationBatchJob]),
  ],
  exports: [RecommendJobService],
})
export class RecommendAiJobModule {}
