import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { HttpService } from "@nestjs/axios";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { BadRequestException } from "@nestjs/common";
import { RecommendJobService } from "src/Modules/recommend-ai-company/recommend-job.service";
import { ApplicantService } from "src/Modules/applicant/applicant.service";
import { CandidateRecommendation } from "src/Modules/recommend-ai-company/interface/recommend-candidate.interface";

@Processor("recommend-candidate")
export class RecommendCandidateProcessor extends WorkerHost {
  constructor(
    private readonly httpService: HttpService,
    private recommendJobService: RecommendJobService,
    private config: ConfigService,
    @InjectDataSource()
    private dataSource: DataSource,
    private applicantService: ApplicantService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log("🔥 Job Started");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { batchId, job_id, project_id } = job.data;

    await this.recommendJobService.updateStatus(batchId, StatusAI.ACTIVE);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.get<string>("RECOMMEND_CANDIDATE")}/${job_id}/match`,
          {
            limit: 2,
            project_id,
          },
        ),
      );
      console.log(response.data);

      const aiResult = response.data.results! as CandidateRecommendation[];

      await this.dataSource.transaction(async (manager) => {
        const batch = await this.recommendJobService.findBatch(
          batchId,
          manager,
        );

        if (!batch) throw new BadRequestException("no batch");

        const aiIds = aiResult.map((item) => item.id);

        const candidates =
          await this.applicantService.getApplicantByCandidateId(aiIds);

        const candidatesMap = new Map(
          candidates.map((candidate) => [candidate.candidateId, candidate]),
        );

        for (const item of aiResult) {
          const applicant = candidatesMap.get(item.id.toString());
          if (!applicant) continue;

          await this.recommendJobService.createRecommend(
            {
              batch,
              applicant,
              years_experience: item.years_experience,
              final_score: item.final_score,
              semantic_score: item.features.semantic_score,
              skill_overlap_score: item.features.skill_overlap_score,
              experience_score: item.features.experience_score,
            },
            manager,
          );
        }
      });

      await this.recommendJobService.updateStatus(batchId, StatusAI.COMPLETED);

      console.log("✅ Job Done");

      return response.data;
    } catch (error) {
      const maxAttempts = job.opts.attempts ?? 1;

      if (job.attemptsMade < maxAttempts) {
        await this.recommendJobService.updateStatus(batchId, StatusAI.RETRYING);
      } else {
        await this.recommendJobService.updateStatus(batchId, StatusAI.FAILED);
      }
      console.log(error);
      throw error;
    }
  }
}
