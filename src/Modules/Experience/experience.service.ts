import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Experience } from "./experience.entity";
import { Repository } from "typeorm";
import { addExperienceDTO } from "./dto/addExperience.dto";
import { updateExperienceDTO } from "./dto/updateExperience.dto";
import { ApplicantService } from "../applicant/applicant.service";

@Injectable()
export class ExperienceService {
  constructor(
    @InjectRepository(Experience)
    private experienceRepository: Repository<Experience>,
    private applicantService: ApplicantService,
  ) {}

  public async addExperience(dto: addExperienceDTO, userId: string) {
    const { title, description, startDate, endDate, company } = dto;

    const applicant =
      await this.applicantService.findApplicantWithIdUser(userId);
    if (!applicant) throw new BadRequestException("not user found");

    const nExper = this.experienceRepository.create({
      title,
      description,
      startDate,
      endDate,
      company,
      applicant,
    });

    await this.experienceRepository.save(nExper);

    const { experiences } = await this.getAllExperienceByApplicant(
      applicant.id,
    );

    return { message: "add experience successful", experiences };
  }

  public async updateExperience(dto: updateExperienceDTO, id: string) {
    const experience = await this.experienceRepository.findOne({
      where: { id },
    });

    if (!experience) throw new BadRequestException("no experience found");

    await this.experienceRepository.update(id, dto);

    return { message: "update experience successful" };
  }

  public async deleteExperience(id: string) {
    const experience = await this.experienceRepository.findOne({
      where: { id },
    });

    if (!experience) throw new BadRequestException("no experience found");

    await this.experienceRepository.delete(id);

    return { message: "delete experience successful" };
  }

  private async getAllExperienceByApplicant(applicantId: string) {
    const experiences = await this.experienceRepository.find({
      where: {
        applicant: {
          id: applicantId,
        },
      },
    });

    return { experiences };
  }
}
