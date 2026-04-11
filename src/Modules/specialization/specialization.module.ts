import { Module } from "@nestjs/common";
import { SpecializationService } from "./specialization.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Specialization } from "./specialization.entity";
import { SpecializationController } from "./specialization.controller";
import { CompanyModule } from "../company/company.module";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../Users/user.module";

@Module({
  providers: [SpecializationService],
  controllers: [SpecializationController],
  imports: [
    JwtModule,
    UserModule,
    CompanyModule,
    TypeOrmModule.forFeature([Specialization]),
  ],
})
export class SpecializationModule {}
