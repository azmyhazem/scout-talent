import { Module } from "@nestjs/common";
import { RecommendJobService } from "./recommend-job.service";

@Module({
  providers: [RecommendJobService],
})
export class RecommendAiModule {}
