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
      relations: ["applicant"],
    });

    if (!experience) throw new BadRequestException("no experience found");

    await this.experienceRepository.update(id, dto);

    const { experiences } = await this.getAllExperienceByApplicant(
      experience.applicant.id,
    );

    return { message: "update experience successful", experiences };
  }

  public async deleteExperience(id: string, userId: string) {
    const experience = await this.experienceRepository.findOne({
      where: { id, applicant: { user: { id: userId } } },
      relations: ["applicant"],
    });

    if (!experience) throw new BadRequestException("no experience found");

    await this.experienceRepository.delete(id);

    const { experiences } = await this.getAllExperienceByApplicant(
      experience.applicant.id,
    );

    return { message: "delete experience successful", experiences };
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
