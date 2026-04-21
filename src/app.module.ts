import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { UserModule } from "./Modules/Users/user.module";
import { MailModule } from "./Shared/Mail/mail.module";
import { CVModule } from "./Modules/CV/cv.module";
import { JobModule } from "./Modules/Job/job.module";
import { ThrottlerModule } from "@nestjs/throttler";
import { SkillModule } from "./Modules/Skills/skills.module";
import { ExperienceModule } from "./Modules/Experience/experience.module";
import { AuthModule } from "./Modules/auth/auth.module";
import { dataSourceOptions } from "db/data_source";
import { ScheduleModule } from "@nestjs/schedule";
import { JobCornModule } from "./Jobs/job.module";
import { InterviewModule } from "./Modules/interview/interview.module";
import { ApplicationModule } from "./Modules/application/application.module";
import { SpecializationModule } from "./Modules/specialization/specialization.module";
import { IndustryModule } from "./Modules/industry/industry.module";
import { BullModule } from "@nestjs/bullmq";
import { QueueModule } from "./queue/queue.module";
import { RecommendAiModule } from "./Modules/recommend-ai-cv/recommend-ai-cv.module";
@Module({
  imports: [
    UserModule,
    CVModule,
    JobModule,
    IndustryModule,
    SpecializationModule,
    SkillModule,
    JobCornModule,
    ExperienceModule,
    MailModule,
    AuthModule,
    InterviewModule,
    ApplicationModule,
    QueueModule,
    RecommendAiModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    BullModule.forRoot({
      connection: {
        host: "localhost",
        port: 6379,
      },
      // connection: {
      //   url: process.env.REDIS_URL,
      // },
    }),
  ],
})
export class AppModule {}
