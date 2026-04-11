import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UserService } from "./user.service";
import { MailModule } from "src/Shared/Mail/mail.module";
import { JwtModule } from "@nestjs/jwt";
import { JobModule } from "../Job/job.module";
import { ApplicationModule } from "../application/application.module";
@Module({
  controllers: [],
  providers: [UserService],
  imports: [
    forwardRef(() => JobModule),
    forwardRef(()=>ApplicationModule),
    MailModule,
    TypeOrmModule.forFeature([User]),
    JwtModule,
  ],
  exports: [UserService],
})
export class UserModule {}
