import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Experience } from "./experience.entity";
import { ExperienceController } from "./experience.controller";
import { ExperienceService } from "./experience.service";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ApplicantModule } from "../applicant/applicant.module";

@Module({
  controllers: [ExperienceController],
  providers: [ExperienceService],
  imports: [
    ApplicantModule,
    UserModule,
    JwtModule,
    TypeOrmModule.forFeature([Experience]),
  ],
})
export class ExperienceModule {}
