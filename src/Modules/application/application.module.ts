import { forwardRef, Module } from "@nestjs/common";
import { ApplicationService } from "./application.service";
import { CandidateController } from "./candidate.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JobApplicant } from "./job_applicant.entity";
import { FeedBack } from "../interview/feedback.entity";
import { JobOffer } from "./jobOffer.entity";
import { Reject } from "./reject.entity";
import { Interview } from "../interview/interviews.entity";
import { UserModule } from "../Users/user.module";
import { JobModule } from "../Job/job.module";
import { CVModule } from "../CV/cv.module";
import { JwtModule } from "@nestjs/jwt";
import { OfferController } from "./offer.controller";
import { ApplicantModule } from "../applicant/applicant.module";

@Module({
  controllers: [CandidateController ,OfferController],
  providers: [ApplicationService ],

  imports: [
    JwtModule,
    forwardRef(() => UserModule),
    JobModule,
    CVModule,
    forwardRef(()=>ApplicantModule),
    TypeOrmModule.forFeature([
      JobApplicant,
      FeedBack,
      JobOffer,
      Reject,
      Interview,
    ]),
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
