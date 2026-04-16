import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CV } from "./cv.entity";
import { EntityManager, Repository } from "typeorm";
import { ApplicantService } from "../applicant/applicant.service";
import { StatusAI } from "src/Shared/Enums/statusAI.enum";
@Injectable()
export class CVService {
  constructor(
    @InjectRepository(CV) private cvRepository: Repository<CV>,
    private applicantService: ApplicantService,
  ) {}

  public async uploadCV(userId: string, url: string, name: string) {
    const user = await this.applicantService.findApplicantWithIdUser(userId);

    if (!user) throw new BadRequestException("user not found");

    const cv = this.cvRepository.create({ name, url, applicant: user });

    const cvN = await this.cvRepository.save(cv);

    return {
      message: "cv upload successful",
      cvId: cvN.id,
      applicantId: user.id,
      projectId: user.industry.projectId,
    };
  }

  public async find(cvId: string) {
    const cv = await this.cvRepository.findOne({
      where: { id: cvId },
    });

    if (!cv) throw new BadRequestException("cv not found");
    return { url: cv.url };
  }

  public async getAllCVFromUser(userId: string) {
    const user = await this.applicantService.findApplicantWithIdUser(userId);

    if (!user) throw new BadRequestException("user not found");

    const cvs = await this.cvRepository.find({
      where: { applicant: { id: user.id } },
    });

    return { cvs };
  }

  public async deleteCV(userId: string, cvId: string) {
    const user = await this.applicantService.findApplicantWithIdUser(userId);

    if (!user) throw new BadRequestException("user not found");

    await this.cvRepository.delete({
      id: cvId,
      applicant: user,
    });
    return { message: "delete successful" };
  }

  public async findCV(id: string) {
    const cv = await this.cvRepository.findOne({ where: { id } });

    return cv;
  }

  public async updateAssetId(
    cvId: string,
    asset_id: string,
    manager: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(CV) : this.cvRepository;

    return repo.update(cvId, { asset_id });
  }

  public async updateStatue(
    cvId: string,
    status: StatusAI,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(CV) : this.cvRepository;
    return repo.update(cvId, { status });
  }
}
