import { Module } from "@nestjs/common";
import { RecommendJobService } from "./recommend-job.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RecommendJobs } from "./recommend-job.entity";

@Module({
  providers: [RecommendJobService],
  imports: [TypeOrmModule.forFeature([RecommendJobs])],
  exports: [RecommendJobService],
})
export class RecommendAiModule {}
