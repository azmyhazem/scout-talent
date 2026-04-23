import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { BadRequestException } from "@nestjs/common";
import { Job, Queue } from "bullmq";
import { JobServices } from "src/Modules/Job/job.service";
import { RecommendJobService } from "src/Modules/recommend-ai-company/recommend-job.service";

@Processor("create-batch-job")
export class CreateBatchJobProcessor extends WorkerHost {
  constructor(
    @InjectQueue("recommend-candidate")
    private recommendcandidate: Queue,
    private recommendJob: RecommendJobService,
    private jobService: JobServices,
  ) {
    super();
  }
  async process(jobProcessor: Job<any, any, string>): Promise<any> {
    console.log("🔥 Job Started");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { job } = jobProcessor.data;

    const batch = await this.recommendJob.createBatch({ job });

    const jobF = await this.jobService.getJob(job.id);

    if (!jobF) throw new BadRequestException("not found job");

    console.log(batch);
    await this.recommendcandidate.add(
      "add-row",
      {
        batchId: batch.id,
        job_id: jobF.jobIdAi,
        project_id: jobF.industry.projectId,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    );
    console.log("✅ Job Done");
  }
}
