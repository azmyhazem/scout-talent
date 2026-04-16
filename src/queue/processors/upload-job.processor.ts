import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { HttpService } from "@nestjs/axios";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { JobServices } from "src/Modules/Job/job.service";
import { firstValueFrom } from "rxjs";

@Processor("upload-job")
export class JobProcessor extends WorkerHost {
  constructor(
    private readonly httpService: HttpService,
    private jobService: JobServices,
    private config: ConfigService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log("🔥 Job Started");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { jobId, title, description, seniority, required_skills } = job.data;

    await this.jobService.updateStatusAi(jobId, StatusAI.ACTIVE);

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.config.get<string>("UPLOAD_JOB")}`, {
          title,
          description,
          seniority,
          required_skills,
        }),
      );

      console.log("AI Response:", response.data);

      await this.dataSource.transaction(async (manager) => {
        await this.jobService.updateJobIdAi(
          jobId,
          response.data.job_id,
          manager,
        );

        await this.jobService.updateStatusAi(
          jobId,
          StatusAI.COMPLETED,
          manager,
        );
      });

      console.log("✅ Job Done");

      return response.data;
    } catch (error) {
      const maxAttempts = job.opts.attempts ?? 1;

      if (job.attemptsMade < maxAttempts) {
        await this.jobService.updateStatusAi(jobId, StatusAI.RETRYING);
      } else {
        await this.jobService.updateStatusAi(jobId, StatusAI.FAILED);
      }
      throw error;
    }
  }
}
