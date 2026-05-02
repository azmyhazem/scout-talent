import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { UserModule } from "../Users/user.module";
import { JobModule } from "../Job/job.module";
import { ApplicationModule } from "../application/application.module";
import { AdminController } from "./admin.controller";
import { PlanModule } from "../plan/plan.module";
import { SubscriptionModule } from "../subscription/subscription.module";

@Module({
  providers: [AdminService],
  controllers: [AdminController],
  imports: [
    UserModule,
    JobModule,
    ApplicationModule,
    PlanModule,
    SubscriptionModule,
  ],
})
export class AdminModule {}
