import { Module } from "@nestjs/common";
import { InterviewService } from "./interview.service";
import { InterviewController } from "./interview.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Interview } from "./interviews.entity";
import { CancelInterview } from "./cancelInterview.entity";
import { FeedBack } from "./feedback.entity";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../Users/user.module";
import { JobApplicant } from "../application/job_applicant.entity";
import { ApplicationModule } from "../application/application.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  providers: [InterviewService],
  controllers: [InterviewController],
  imports: [
    JwtModule,
    UserModule,
    ApplicationModule,
    NotificationModule,
    TypeOrmModule.forFeature([
      Interview,
      CancelInterview,
      FeedBack,
      JobApplicant,
    ]),
  ],
})
export class InterviewModule {}
