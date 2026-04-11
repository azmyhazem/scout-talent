import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Specialization } from "./specialization.entity";
import { Repository } from "typeorm";
import { addSpecializationDTO } from "./dto/addSpecialization.dto";
import { CompanyService } from "../company/company.service";

@Injectable()
export class SpecializationService {
  constructor(
    @InjectRepository(Specialization)
    private specializationRepository: Repository<Specialization>,
    private companyService: CompanyService,
  ) {}

  public async addSpecialization(dto: addSpecializationDTO, Id: string) {
    const { name } = dto;

    const user = await this.companyService.findCompanyWithIdUser(Id);
    if (!user) throw new BadRequestException("not user found");

    const sp = await this.specializationRepository.findOne({ where: { name } });
    if (sp)
      throw new BadRequestException("this name already in your information");

    const NSkill = this.specializationRepository.create({
      name,
      company: user,
    });

    await this.specializationRepository.save(NSkill);

    return { message: "add successful" };
  }

  public async deleteSkill(id: string, userId: string) {
    const result = await this.specializationRepository.delete({
      id,
      company: { user: { id: userId } },
    });

    if (result.affected === 0) {
      throw new BadRequestException("specialization not found");
    }

    return { message: "delete successful" };
  }
}
