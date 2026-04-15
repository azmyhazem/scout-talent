import { Body, Controller, Post } from "@nestjs/common";
import { IndustryRepository } from "./industry.repository";
import { IndustryName } from "src/Shared/Enums/industry.enum";

@Controller("industry")
export class industryController {
  constructor(private industryRepo: IndustryRepository) {}

  @Post("create")
  public create(@Body("name") name: IndustryName) {
    return this.industryRepo.create(name);
  }
}
