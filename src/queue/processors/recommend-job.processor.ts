import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { HttpService } from "@nestjs/axios";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { JobServices } from "src/Modules/Job/job.service";
import { BadRequestException } from "@nestjs/common";
import { RecommendAiService } from "src/Modules/recommend-ai-cv/recommend-ai-cv.service";
import { JobRecommendation } from "src/Modules/recommend-ai-cv/interface/recommend-job.interface";

@Processor("recommend-jobs")
export class RecommendJobProcessor extends WorkerHost {
  constructor(
    private readonly httpService: HttpService,
    private recommendAiService: RecommendAiService,
    private config: ConfigService,
    @InjectDataSource()
    private dataSource: DataSource,
    private jobService: JobServices,

  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log("🔥 Job Started");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { batchId, asset_id, candidate_Id } = job.data;

    await this.recommendAiService.updateStatus(batchId, StatusAI.ACTIVE);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.get<string>("RECOMMEND_JOB")}/${candidate_Id}/recommend_jobs`,
          {
            limit: 2,
            asset_id,
          },
        ),
      );
      console.log(response.data);

      const aiResult = response.data.results! as JobRecommendation[];

      await this.dataSource.transaction(async (manager) => {
        const batch = await this.recommendAiService.findBatch(batchId, manager);

        if (!batch) throw new BadRequestException("no batch");

        const aiIds = aiResult.map((item) => item.job_id);

        const jobs = await this.jobService.getJobsByJobIdAi(aiIds);

        const jobsMap = new Map(jobs.map((job) => [job.jobIdAi, job]));

        for (const item of aiResult) {
          const job = jobsMap.get(item.job_id.toString());
          if (!job) continue;

          await this.recommendAiService.createRecommend(
            {
              batch,
              job,
              final_score: item.final_score,
              similarity_score: item.similarity_score,
              skill_match_score: item.skill_match_score,
              experience_match_score: item.experience_match_score,
              seniority_match: item.seniority_match,
              matched_skills: item.matched_skills,
              missing_skills: item.missing_skills,
            },
            manager,
          );
        }
      });

      await this.recommendAiService.updateStatus(batchId, StatusAI.COMPLETED);

      console.log("✅ Job Done");

      return response.data;
    } catch (error) {
      const maxAttempts = job.opts.attempts ?? 1;

      if (job.attemptsMade < maxAttempts) {
        await this.recommendAiService.updateStatus(batchId, StatusAI.RETRYING);
      } else {
        await this.recommendAiService.updateStatus(batchId, StatusAI.FAILED);
      }
      console.log(error);
      throw error;
    }
  }
}
