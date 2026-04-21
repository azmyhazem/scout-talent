import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

@Processor("update-job-status")
export class UpdateJobStatusProcessor extends WorkerHost {
  constructor(
    private readonly httpService: HttpService,
    private config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log(`🔥 Job Started: ${job.id}`);

    const { job_id, status } = job.data;

    if (!job_id || !status) {
      throw new Error("Invalid job data");
    }

    try {
      await firstValueFrom(
        this.httpService.patch(
          `${this.config.get<string>("UPDATE_JOB_STATUS")}/${job_id}`,
          { status },
          { timeout: 5000 },
        ),
      );

      console.log(`✅ Job Done: ${job.id}`);
      return true;
    } catch (error) {
      console.error(error);

      throw error; // مهم عشان retry
    }
  }
}
