import { Module } from "@nestjs/common";
import { SkillController } from "./skills.controller";
import { SkillService } from "./skills.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Skill } from "./skills.entity";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ApplicantModule } from "../applicant/applicant.module";

@Module({
  controllers: [SkillController],
  providers: [SkillService],
  imports: [
    ApplicantModule,
    UserModule,
    JwtModule,
    TypeOrmModule.forFeature([Skill]),
  ],
})
export class SkillModule {}
