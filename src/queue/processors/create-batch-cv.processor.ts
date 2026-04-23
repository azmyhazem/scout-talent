import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { BadRequestException } from "@nestjs/common";
import { Job, Queue } from "bullmq";
import { CVService } from "src/Modules/CV/cv.service";
import { RecommendAiService } from "src/Modules/recommend-ai-cv/recommend-ai-cv.service";

@Processor("create-batch-cv")
export class CreateBatchCVProcessor extends WorkerHost {
  constructor(
    @InjectQueue("recommend-jobs")
    private recommendJob: Queue,
    private recommendAiService: RecommendAiService,
    private cvService: CVService,
  ) {
    super();
  }
  async process(job: Job<any, any, string>): Promise<any> {
    console.log("🔥 Job Started");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { cv } = job.data;

    const recommend = await this.recommendAiService.createBatch({
      cv,
    });

    const cvF = await this.cvService.findCV(cv.id);

    if (!cvF) throw new BadRequestException("not found cv");

    console.log(recommend);
    await this.recommendJob.add(
      "row",
      {
        batchId: recommend.id,
        asset_id: cvF.asset_id,
        candidate_Id: cvF.applicant.candidateId,
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
