import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Industry } from "./industry.entity";
import { IndustryRepository } from "./industry.repository";
import { industryController } from "./indu.controller";

@Module({
  providers: [IndustryRepository],
  controllers: [industryController],
  imports: [TypeOrmModule.forFeature([Industry])],
  exports: [IndustryRepository],
})
export class IndustryModule {}
