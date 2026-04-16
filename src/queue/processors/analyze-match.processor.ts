import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { HttpService } from "@nestjs/axios";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { ApplicationService } from "src/Modules/application/application.service";

@Processor("analyze-match")
export class AnalyzeMatchProcessor extends WorkerHost {
  constructor(
    private readonly httpService: HttpService,
    private applicationService: ApplicationService,
    private config: ConfigService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log("🔥 Job Started");
    console.log(job);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { jobIdAi, applicationId, candidateId, asset_id } = job.data;

    await this.applicationService.updateStatusAi(
      applicationId,
      StatusAI.ACTIVE,
    );

    console.log(jobIdAi, applicationId, candidateId);
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.get<string>("ANALYZE_MATCH")}/${candidateId}/analyze_match`,
          {
            job_id: jobIdAi,
            asset_id,
          },
        ),
      );

      console.log("AI Response:", response.data);

      await this.dataSource.transaction(async (manager) => {
        await this.applicationService.updateResult(
          applicationId,
          response.data.results,
          manager,
        );

        await this.applicationService.updateStatusAi(
          applicationId,
          StatusAI.COMPLETED,
          manager,
        );
      });

      console.log("✅ Job Done");

      return response.data;
    } catch (error) {
      const maxAttempts = job.opts.attempts ?? 1;

      if (job.attemptsMade < maxAttempts) {
        await this.applicationService.updateStatusAi(
          applicationId,
          StatusAI.RETRYING,
        );
      } else {
        await this.applicationService.updateStatusAi(
          applicationId,
          StatusAI.FAILED,
        );
      }
      console.log(error);
      throw error;
    }
  }
}
