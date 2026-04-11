import { forwardRef, Module } from "@nestjs/common";
import { JobServices } from "./job.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { JobController } from "./job.controller";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { CompanyModule } from "../company/company.module";


@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(()=>CompanyModule),
    JwtModule,
    TypeOrmModule.forFeature([
      Job,
    ]),
  ],
  controllers: [JobController],
  providers: [JobServices],
  exports: [JobServices],
})
export class JobModule {}
