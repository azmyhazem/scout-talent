import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Plan } from "./plan.entity";
import { PlanService } from "./plan.service";
import { PlanController } from "./plan.controller";

@Module({
  providers: [PlanService],
  controllers: [PlanController],
  imports: [TypeOrmModule.forFeature([Plan])],
  exports: [PlanService],
})
export class PlanModule {}
