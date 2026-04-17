import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RecommendJobs } from "./recommend-job.entity";
import { Repository } from "typeorm";
import { createRecommend } from "./dto/createRecommend.dto";

@Injectable()
export class RecommendJobService {
  constructor(
    @InjectRepository(RecommendJobs)
    private recommendJobsRepository: Repository<RecommendJobs>,
  ) {}

  create(data: createRecommend) {
    const recommend = this.recommendJobsRepository.create(data);
    return this.recommendJobsRepository.save(recommend);
  }
}
