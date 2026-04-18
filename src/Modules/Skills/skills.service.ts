import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { addSkillDTO } from "./dto/addSkill.dto";
import { Skill } from "./skills.entity";
import { ApplicantService } from "../applicant/applicant.service";

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    private applicantService: ApplicantService,
  ) {}

  public async addSkill(dto: addSkillDTO, Id: string) {
    const { name } = dto;

    const user = await this.applicantService.findApplicantWithIdUser(Id);
    if (!user) throw new BadRequestException("not user found");

    const skill = await this.skillRepository.findOne({ where: { name } });
    if (skill)
      throw new BadRequestException("this name already in your information");

    const NSkill = this.skillRepository.create({ name, applicant: user });

    await this.skillRepository.save(NSkill);

    const { skills } = await this.getAllSkillsByApplicant(Id);

    return { message: "add successful", skills };
  }

  public async deleteSkill(id: string, userId: string) {
    const result = await this.skillRepository.delete({
      id,
      applicant: { user: { id: userId } },
    });

    if (result.affected === 0) {
      throw new BadRequestException("Skill not found");
    }

    const { skills } = await this.getAllSkillsByApplicant(userId);

    return { message: "delete successful", skills };
  }

  private async getAllSkillsByApplicant(userId: string) {
    const skills = await this.skillRepository.find({
      where: {
        applicant: {
          user: { id: userId },
        },
      },
    });

    return { skills };
  }
}
