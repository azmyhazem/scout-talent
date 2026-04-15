import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Industry } from "./industry.entity";
import { Repository } from "typeorm";
import { IndustryName } from "../../Shared/Enums/industry.enum";

@Injectable()
export class IndustryRepository {
  constructor(
    @InjectRepository(Industry)
    private industryRepo: Repository<Industry>,
  ) {}

  find(name: IndustryName) {
    return this.industryRepo.findOne({
      where: { name },
    });
  }

  create(name: IndustryName) {
    const ind = this.industryRepo.create({ name });
    return this.industryRepo.save(ind);
  }
}
