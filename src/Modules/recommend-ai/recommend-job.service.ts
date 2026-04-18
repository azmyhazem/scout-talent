import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RecommendJobs } from "./recommend-job.entity";
import { EntityManager, Repository } from "typeorm";
import { createRecommend } from "./dto/createRecommend.dto";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
import { JobRecommendation } from "./interface/recommend-job.interface";

@Injectable()
export class RecommendJobService {
  constructor(
    @InjectRepository(RecommendJobs)
    private recommendJobsRepository: Repository<RecommendJobs>,
  ) {}

  create(data: createRecommend, manager: EntityManager) {
    const repo = manager
      ? manager.getRepository(RecommendJobs)
      : this.recommendJobsRepository;
    const recommend = repo.create(data);
    return repo.save(recommend);
  }

  updateStatus(id: string, status: StatusAI, manger?: EntityManager) {
    const repo = manger
      ? manger.getRepository(RecommendJobs)
      : this.recommendJobsRepository;
    return repo.update(id, { status });
  }

  updateRecommends(
    id: string,
    recommends: JobRecommendation[],
    manger: EntityManager,
  ) {
    const repo = manger
      ? manger.getRepository(RecommendJobs)
      : this.recommendJobsRepository;
    return repo.update(id, { recommends, generatedAiAt: new Date() });
  }

  findByCandidateAndAsset(candidateId: string, assetId: string) {
    return this.recommendJobsRepository.findOne({
      where: {
        candidate: {
          id: candidateId,
        },
        asset: {
          id: assetId,
        },
      },
    });
  }
}
