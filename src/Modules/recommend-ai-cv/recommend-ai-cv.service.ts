import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RecommendJobs } from "./recommend-job.entity";
import { EntityManager, Repository } from "typeorm";
import { createRecommend } from "./dto/createRecommend.dto";
import { createBatch } from "./dto/createBatch.dto";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import { RecommendationBatchCV } from "./recommendation-batch-cv.entity";

@Injectable()
export class RecommendAiService {
  constructor(
    @InjectRepository(RecommendJobs)
    private recommendJobsRepository: Repository<RecommendJobs>,

    @InjectRepository(RecommendationBatchCV)
    private batchRepository: Repository<RecommendationBatchCV>,
  ) {}

  async createRecommend(data: createRecommend, manager: EntityManager) {
    const repo = manager
      ? manager.getRepository(RecommendJobs)
      : this.recommendJobsRepository;

    const recommend = repo.create(data);

    return await repo.save(recommend);
  }

  createBatch(data: createBatch, manager: EntityManager) {
    const repo = manager
      ? manager.getRepository(RecommendationBatchCV)
      : this.batchRepository;
    const recommend = repo.create(data);
    return repo.save(recommend);
  }

  findBatch(id: string, manager: EntityManager) {
    const repo = manager
      ? manager.getRepository(RecommendationBatchCV)
      : this.batchRepository;

    return repo.findOne({
      where: {
        id,
      },
    });
  }

  async updateStatus(id: string, status: StatusAI, manger?: EntityManager) {
    const repo = manger
      ? manger.getRepository(RecommendationBatchCV)
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

  async getLastBatchByCv(cvId: string, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(RecommendationBatchCV)
      : this.batchRepository;

    return await repo.findOne({
      where: {
        cv: {
          id: cvId,
        },
      },
      order: {
        createdAt: "DESC",
      },
      relations: ["recommendation"],
    });
  }
}
