import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { StringValue } from "ms";
import { MailModule } from "src/Shared/Mail/mail.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../Users/user.entity";
import { UserModule } from "../Users/user.module";
import { GoogleStrategy } from "./strategies/google.strategy";
import { UserToken } from "../Users/user-token.entity";
import { Outbox } from "../Users/outbox.entity";
import { ApplicantModule } from "../applicant/applicant.module";
import { CompanyModule } from "../company/company.module";
import { RefreshTokenStrategy } from "./strategies/refreshToken.strategy";
import { IndustryModule } from "../industry/industry.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, RefreshTokenStrategy],
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get<string>("JWT_Access_SECRET"),
          signOptions: {
            expiresIn: config.get<string>(
              "JWT_Access_EXPIRES_IN",
            ) as StringValue,
          },
        };
      },
    }),
    MailModule,
    UserModule,
    IndustryModule,
    ApplicantModule,
    CompanyModule,
    TypeOrmModule.forFeature([User, UserToken, Outbox]),
  ],
})
export class AuthModule {}
