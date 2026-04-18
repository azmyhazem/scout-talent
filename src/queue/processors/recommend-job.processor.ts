import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { HttpService } from "@nestjs/axios";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { RecommendJobService } from "src/Modules/recommend-ai/recommend-job.service";

@Processor("recommend-jobs")
export class RecommendJobProcessor extends WorkerHost {
  constructor(
    private readonly httpService: HttpService,
    private recommendJobService: RecommendJobService,
    private config: ConfigService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log("🔥 Job Started");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { recommendId, asset_id, candidate_id } = job.data;

    console.log(recommendId, asset_id, candidate_id)
    await this.recommendJobService.updateStatus(recommendId, StatusAI.ACTIVE);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.get<string>("RECOMMEND_JOB")}/${candidate_id}/recommend_jobs`,
          {
            limit: 2,
            asset_id,
          },
        ),
      );
      console.log(response.data)

      await this.dataSource.transaction(async (manager) => {
        await this.recommendJobService.updateRecommends(
          recommendId,
          response.data.results,
          manager,
        );

        await this.recommendJobService.updateStatus(
          recommendId,
          StatusAI.COMPLETED,
          manager,
        );
      });

      console.log("✅ Job Done");

      return response.data;
    } catch (error) {
      const maxAttempts = job.opts.attempts ?? 1;

      if (job.attemptsMade < maxAttempts) {
        await this.recommendJobService.updateStatus(
          recommendId,
          StatusAI.RETRYING,
        );
      } else {
        await this.recommendJobService.updateStatus(
          recommendId,
          StatusAI.FAILED,
        );
      }
      console.log(error);
      throw error;
    }
  }
}
