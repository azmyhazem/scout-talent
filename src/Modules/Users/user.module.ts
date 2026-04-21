import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UserService } from "./user.service";
import { MailModule } from "src/Shared/Mail/mail.module";
import { JwtModule } from "@nestjs/jwt";
import { JobModule } from "../Job/job.module";
import { ApplicationModule } from "../application/application.module";
import { UserController } from "./user.controller";
import { CompanyModule } from "../company/company.module";
import { ApplicantModule } from "../applicant/applicant.module";
@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    forwardRef(() => JobModule),
    forwardRef(()=>ApplicationModule),
    MailModule,
    TypeOrmModule.forFeature([User]),
    JwtModule,
    forwardRef(()=>CompanyModule),
    forwardRef(()=>ApplicantModule)
  ],
  exports: [UserService],
})
export class UserModule {}
