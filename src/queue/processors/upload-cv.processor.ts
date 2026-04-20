import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { Job, Queue } from "bullmq";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import * as fs from "fs";
import FormData from "form-data";
import { CVService } from "src/Modules/CV/cv.service";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import { ApplicantService } from "src/Modules/applicant/applicant.service";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { RecommendAiService } from "src/Modules/recommend-ai-cv/recommend-ai-cv.service";

@Processor("upload-cv")
export class CVProcessor extends WorkerHost {
  constructor(
    private readonly httpService: HttpService,
    private cvService: CVService,
    private applicantService: ApplicantService,
    private config: ConfigService,
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectQueue("recommend-jobs")
    private recommendJob: Queue,
    private recommendAiService: RecommendAiService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log("🔥 Job Started");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { file, cvId, applicantId, projectId, candidateId } = job.data;

    if (!file) {
      throw new Error("No file found in job data");
    }

    await this.cvService.updateStatue(cvId, StatusAI.ACTIVE);

    try {
      const formData = new FormData();
      formData.append(
        "file",
        fs.createReadStream(file.path),
        file.originalname,
      );

      if (candidateId) {
        formData.append("candidate_id", candidateId);
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.get<string>("UPLOAD_CV")}/${projectId}`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          },
        ),
      );

      const recommend = await this.dataSource.transaction(async (manager) => {
        await this.cvService.updateAssetId(
          cvId,
          response.data.asset_id,
          manager,
        );

        const applicant = await this.applicantService.updateCandidataId(
          applicantId,
          response.data.candidate_id,
          manager,
        );

        const cv = await this.cvService.updateStatue(
          cvId,
          StatusAI.COMPLETED,
          manager,
        );

        if (!cv.isPrimary) {
          return { recommend: null };
        }

        const recommend = await this.recommendAiService.createBatch(
          {
            cv,
          },
          manager,
        );

        return { recommend, asset_id: cv.asset_id , candidate_Id:applicant.candidateId};
      });

      console.log(recommend)
      if (recommend.recommend) {
        await this.recommendJob.add(
          "row",
          {
            batchId: recommend.recommend.id,
            asset_id: recommend.asset_id,
            candidate_Id: recommend.candidate_Id
          },
          {
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 2000,
            },
          },
        );
      }
      console.log("✅ Job Done");

      return response.data;
    } catch (error) {
      const maxAttempts = job.opts.attempts ?? 1;

      if (job.attemptsMade < maxAttempts) {
        await this.cvService.updateStatue(cvId, StatusAI.RETRYING);
      } else {
        await this.cvService.updateStatue(cvId, StatusAI.FAILED);
      }
      throw error;
    }
  }
}
