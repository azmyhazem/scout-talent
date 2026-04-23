import { BadRequestException, Injectable } from "@nestjs/common";
import { RecommendationBatchJob } from "./recommendation-batch-job.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { createBatch } from "./dto/createBatch.dto";
import { RecommendCandidate } from "./recommend-candidate.entity";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import { createRecommend } from "./dto/createRecommend.dto";

@Injectable()
export class RecommendJobService {
  constructor(
    @InjectRepository(RecommendCandidate)
    private recommendCandidatesRepository: Repository<RecommendCandidate>,

    @InjectRepository(RecommendationBatchJob)
    private batchRepository: Repository<RecommendationBatchJob>,
  ) {}

  async createBatch(data: createBatch, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(RecommendationBatchJob)
      : this.batchRepository;

    const batch = repo.create(data);

    return await repo.save(batch);
  }

  async createRecommend(data: createRecommend, manager: EntityManager) {
    const repo = manager
      ? manager.getRepository(RecommendCandidate)
      : this.recommendCandidatesRepository;

    const recommend = repo.create(data);

    return await repo.save(recommend);
  }

  async updateStatus(id: string, status: StatusAI, manger?: EntityManager) {
    const repo = manger
      ? manger.getRepository(RecommendationBatchJob)
      : this.batchRepository;

    const batch = await this.batchRepository.findOne({
      where: {
        id,
      },
    });
    if (!batch) throw new BadRequestException("there is no batch");

    batch.status = status;

    return repo.save(batch);
  }

  findBatch(id: string, manager: EntityManager) {
    const repo = manager
      ? manager.getRepository(RecommendationBatchJob)
      : this.batchRepository;

    return repo.findOne({
      where: {
        id,
      },
    });
  }

  async getLastBatchByJob(jobId: string, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(RecommendationBatchJob)
      : this.batchRepository;

    return await repo.findOne({
      where: {
        job: {
          id: jobId,
        },
      },
      order: {
        createdAt: "DESC",
      },
      relations: ["recommendation","recommendation.applicant.user"],
    });
  }
}
