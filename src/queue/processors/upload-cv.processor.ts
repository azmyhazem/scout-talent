import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
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

@Processor("upload-cv")
export class CVProcessor extends WorkerHost {
  constructor(
    private readonly httpService: HttpService,
    private cvService: CVService,
    private applicantService: ApplicantService,
    private config: ConfigService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log("🔥 Job Started");
    console.log(job)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { file, cvId, applicantId, projectId } = job.data;

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
      console.log("AI Response:", response.data);
      await this.dataSource.transaction(async (manager) => {
        await this.cvService.updateAssetId(
          cvId,
          response.data.asset_id,
          manager,
        );

        await this.applicantService.updateCandidataId(
          applicantId,
          response.data.candidate_id,
          manager,
        );

        await this.cvService.updateStatue(cvId, StatusAI.COMPLETED, manager);
      });

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
