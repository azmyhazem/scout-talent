import { forwardRef, Module } from "@nestjs/common";
import { JobServices } from "./job.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { JobController } from "./job.controller";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { CompanyModule } from "../company/company.module";
import { QueueModule } from "src/queue/queue.module";
import { IndustryModule } from "../industry/industry.module";
import { RecommendAiJobModule } from "../recommend-ai-company/recommend-ai-company.module";
import { CVModule } from "../CV/cv.module";
import { ApplicantModule } from "../applicant/applicant.module";
import { ApplicationModule } from "../application/application.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => CompanyModule),
    JwtModule,
    TypeOrmModule.forFeature([Job]),
    QueueModule,
    IndustryModule,
    RecommendAiJobModule,
    CVModule,
    ApplicantModule,
    ApplicationModule,
    NotificationModule,
  ],
  controllers: [JobController],
  providers: [JobServices],
  exports: [JobServices],
})
export class JobModule {}
