import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { User } from "../Users/user.entity";
import { DataSource, Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { registerDTO } from "./dto/register.dto";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { loginDTO } from "./dto/login.dto";
import { forgetPasswordDTO } from "./dto/forget_password.dto";
import { resetPasswordDTO } from "./dto/reset_password.dto";
import { StringValue } from "ms";
import { resendEmailVerify } from "./dto/resendEmailVerify.dto";
import { userRoleDTO } from "./dto/userRole.dto";
import { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { generateToken } from "src/Shared/utils/generate.util";
import { mintesToMilliseconds } from "src/Shared/utils/cookie.util";
import { Outbox } from "../Users/outbox.entity";
import { EVENT_TYPE } from "src/Shared/Enums/outbox.enum";
import { UserToken } from "../Users/user-token.entity";
import { UserTokenType } from "src/Shared/Enums/UserToken.enum";
import { requestRestoreDTO } from "./dto/requestRestore.dto";
import { UserService } from "../Users/user.service";
import { ApplicantService } from "../applicant/applicant.service";
import { CompanyService } from "../company/company.service";
import { IndustryRepository } from "../industry/industry.repository";
import { SubscriptionService } from "../subscription/subscription.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserToken)
    private userTokenRepository: Repository<UserToken>,
    @InjectRepository(Outbox) private outboxRepository: Repository<Outbox>,
    private config: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
    private applicantService: ApplicantService,
    private companyService: CompanyService,
    private industryRepo: IndustryRepository,
    private subscriptionService: SubscriptionService,
  ) {}

  /**
   * user register
   * @param dto name , email, password, role
   * @returns message
   */
  public async register(dto: registerDTO) {
    const {
      name,
      email,
      password,
      linkedIn_profile,
      location,
      applicant,
      role,
    } = dto;

    const user = await this.userService.findUserByEmail(email);

    if (user) throw new BadRequestException("This email is already registered");

    const token = generateToken();

    await this.dataSource.transaction(async (manager) => {
      const hash = await this.hash(password);

      const user = await this.userService.createUser(
        {
          name,
          email,
          password: hash,
          linkedIn_profile,
          location,
          role,
          slug: this.generateSlug(name),
        },
        manager,
      );

      await this.subscriptionService.createDefaultSubscription(user, manager);

      if (role === RoleUser.APPLICANT && applicant) {
        const { phone, industry, job_title } = applicant;

        const industryR = await this.industryRepo.find(industry);

        if (!industryR) throw new BadRequestException("industry not found");

        await this.applicantService.createApplicant(
          { phone, job_title, user, industry: industryR },
          manager,
        );
      } else {
        await this.companyService.createCompany({ user }, manager);
      }

      const emailverify = manager.create(UserToken, {
        user: user,
        token,
        type: UserTokenType.VERIFY_EMAIL,
        expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
      });

      await manager.save(emailverify);

      const outbox = manager.create(Outbox, {
        event_type: EVENT_TYPE.SEND_VERIFICATION_EMAIL,
        payload: { email, token },
        nextRetryAt: new Date(),
      });
      await manager.save(outbox);
    });

    return {
      message: "Verification email sent successfully. Please check your inbox.",
    };
  }

  /**
   * user login
   * @param dto email , password
   * @returns message
   */
  public async login(dto: loginDTO) {
    const { email, password, rememberMe } = dto;

    const fakeHash = "$2b$10$abcdefghijklmnopqrstuv1234567890";

    const user = await this.userService.findUserByEmailWithPassword(email);

    let isValid = false;

    if (user) {
      isValid = await this.compare(password, user.password);
    } else {
      await this.compare(password, fakeHash);
    }
    if (!user || !isValid)
      throw new UnauthorizedException("Invalid email or password");

    if (!user.isEmailVerified) {
      throw new BadRequestException(
        "Please verify your email before logging in",
      );
    }

    if (user.isDelete)
      throw new BadRequestException(
        "Account is deleted. Please restore it before continuing.",
      );

    const payload: JwtPayloadType = { id: user.id, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshExpires = rememberMe
      ? (this.config.get<string>("JWT_REFRESH_EXPIRES_IN") as StringValue)
      : (this.config.get<string>(
          "JWT_REFRESH_EXPIRES_IN_SHORT",
        ) as StringValue);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>("JWT_Refresh_SECRET"),
      expiresIn: refreshExpires,
    });

    const HrefreshToken = await this.hash(refreshToken);

    await this.userService.updateAuth(user.id, {
      refreshToken: HrefreshToken,
    });

    return {
      message: "login successful",
      accessToken,
      refreshToken,
      u: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  }

  public async resendEmailVerify(dto: resendEmailVerify) {
    const { email } = dto;

    const user = await this.userService.findUserByEmail(email);

    if (user && !user.isEmailVerified) {
      const token = generateToken();

      await this.dataSource.transaction(async (manager) => {
        const emailverify = manager.create(UserToken, {
          user: user,
          token,
          type: UserTokenType.VERIFY_EMAIL,
          expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
        });

        await manager.save(emailverify);

        const outbox = manager.create(Outbox, {
          event_type: EVENT_TYPE.SEND_VERIFICATION_EMAIL,
          payload: { email, token },
          nextRetryAt: new Date(),
        });
        await manager.save(outbox);
      });
    }
    return {
      message: "Verification email sent successfully. Please check your inbox.",
    };
  }

  public async getAccessToken(refreshToken: string) {
    const payload: JwtPayloadType = await this.jwtService.verifyAsync(
      refreshToken,
      {
        secret: this.config.get<string>("JWT_Refresh_SECRET"),
      },
    );

    const user = await this.userService.findUserByIdWithToken(payload.id);

    if (!user || !user.refreshToken)
      throw new BadRequestException("Access denied");

    const isMatch = await this.compare(refreshToken, user.refreshToken);
    if (!isMatch) throw new BadRequestException("Invalid refresh token");

    const newAccessToken = await this.jwtService.signAsync({
      id: user.id,
      role: user.role,
    });

    return { accessToken: newAccessToken };
  }

  public async logOut(id: string) {
    const user = await this.userService.findUserByIdWithToken(id);

    if (!user) throw new BadRequestException("not found user");

    await this.userService.updateAuth(user.id, { refreshToken: "" });

    return true;
  }

  public async requestRestore(dto: requestRestoreDTO) {
    const { email } = dto;

    const user = await this.userService.findUserByEmail(email);

    if (user && user.isDelete) {
      const token = generateToken();

      await this.dataSource.transaction(async (manager) => {
        const restore = manager.create(UserToken, {
          user,
          token,
          type: UserTokenType.RESTORE_ACCOUNT,
          expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
        });

        await manager.save(restore);

        const outbox = manager.create(Outbox, {
          event_type: EVENT_TYPE.SEND_RESTORE_EMAIL,
          payload: { email, token },
          nextRetryAt: new Date(),
        });
        await manager.save(outbox);
      });
    }
    return { message: "If this email exists, we sent a reset link" };
  }

  public async confirmRestore(token: string) {
    const record = await this.userTokenRepository.findOne({
      where: { token, type: UserTokenType.RESTORE_ACCOUNT },
      relations: ["user"],
    });

    if (!record) {
      throw new BadRequestException("Invalid token");
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException("Token expired");
    }

    await this.dataSource.transaction(async (manager) => {
      await this.userService.restoreAccount(record.user.id, manager);

      await manager.delete(UserToken, record.id);
    });

    return { message: "restore Account successful" };
  }
  /**
   * to verify user's email
   * @param id user Id
   * @param verificationToken
   * @returns message
   */
  public async verifyEmail(token: string) {
    const record = await this.userTokenRepository.findOne({
      where: { token, type: UserTokenType.VERIFY_EMAIL },
      relations: ["user"],
    });

    if (!record) {
      throw new BadRequestException("Invalid token");
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException("Token expired");
    }

    await this.dataSource.transaction(async (manager) => {
      await this.userService.verify(record.user.id, manager);

      await manager.delete(UserToken, record.id);
    });

    return { message: "your email has been verify , you can log in now" };
  }

  /**
   * user forget password
   * @param dto email
   * @returns message
   */
  public async forgetPassword(dto: forgetPasswordDTO) {
    const { email } = dto;

    const user = await this.userService.findUserByEmail(email);

    if (user) {
      const token = generateToken();

      await this.dataSource.transaction(async (manager) => {
        const resetPassword = manager.create(UserToken, {
          user,
          token,
          type: UserTokenType.RESET_PASSWORD,
          expiresAt: new Date(Date.now() + mintesToMilliseconds(15)),
        });

        await manager.save(resetPassword);

        const outbox = manager.create(Outbox, {
          event_type: EVENT_TYPE.SEND_RESET_PASSWORD,
          payload: { email, token },
          nextRetryAt: new Date(),
        });
        await manager.save(outbox);
      });
    }
    return { message: "If this email exists, we sent a reset link" };
  }

  /**
   * update user's password
   * @param dto new password
   * @param id user id
   * @param resetPasswordToken
   * @returns message
   */
  public async resetPassword(dto: resetPasswordDTO, token: string) {
    const record = await this.userTokenRepository.findOne({
      where: { token, type: UserTokenType.RESET_PASSWORD },
      relations: ["user"],
    });

    if (!record) {
      throw new BadRequestException("Invalid token");
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException("Token expired");
    }

    const { newPassword } = dto;
    const hashPassword = await bcrypt.hash(newPassword, 10);

    await this.dataSource.transaction(async (manager) => {
      await this.userService.updatePassword(
        record.user.id,
        hashPassword,
        manager,
      );

      await manager.delete(UserToken, record.id);
    });

    return { message: "password update successful" };
  }

  public async GoogleAuth(email: string, name: string) {
    let user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      const password = randomBytes(12).toString("hex");

      const hash = await this.hash(password);

      user = await this.userService.createUser({
        name,
        email,
        password: hash,
        isEmailVerified: true,
        role: RoleUser.APPLICANT,
        slug: this.generateSlug(name),
      });

      return {
        needRole: true,
        userId: user.id,
        token: null,
      };
    }
    const payload: JwtPayloadType = { id: user.id, role: user.role };

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>("JWT_Refresh_SECRET"),
      expiresIn: this.config.get<string>(
        "JWT_REFRESH_EXPIRES_IN",
      ) as StringValue,
    });

    const HrefreshToken = await this.hash(refreshToken);

    return await this.dataSource.transaction(async (manager) => {
      await this.userService.updateAuth(
        user.id,
        { refreshToken: HrefreshToken },
        manager,
      );

      await this.userService.verify(user.id, manager);

      return {
        needRole: false,
        token: { refreshToken },
        userId: null,
      };
    });
  }

  public async SelectRoleUser(dto: userRoleDTO, id: string) {
    const user = await this.userService.findUserByIdWithToken(id);
    if (!user) throw new BadRequestException("no user found , try again");

    const { role, applicant, location, linkedIn_profile } = dto;

    const payload: JwtPayloadType = { id, role };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>("JWT_Refresh_SECRET"),
      expiresIn: this.config.get<string>(
        "JWT_REFRESH_EXPIRES_IN",
      ) as StringValue,
    });

    const HrefreshToken = await this.hash(refreshToken);
    await this.dataSource.transaction(async (manager) => {
      await this.userService.updateAuth(
        user.id,
        {
          role,
          refreshToken: HrefreshToken,
          linkedIn_profile,
          location,
        },
        manager,
      );

      if (role === RoleUser.APPLICANT && applicant) {
        const industryR = await this.industryRepo.find(applicant.industry);

        if (!industryR) throw new BadRequestException("industry not found");

        await this.applicantService.createApplicant(
          {
            user,
            industry: industryR,
            job_title: applicant.job_title,
            phone: applicant.phone,
          },
          manager,
        );
      } else {
        await this.companyService.createCompany({ user }, manager);
      }
    });

    return {
      message: "login successful",
      accessToken,
      refreshToken,
      u: {
        id: user.id,
        name: user.name,
        role: role,
      },
    };
  }

  public async getMe(refreshToken: string) {
    const payload: JwtPayloadType = await this.jwtService.verifyAsync(
      refreshToken,
      {
        secret: this.config.get<string>("JWT_Refresh_SECRET"),
      },
    );

    const user = await this.userService.findUserByIdWithToken(payload.id);

    if (!user || !user.refreshToken)
      throw new BadRequestException("Access denied");

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) throw new BadRequestException("Invalid refresh token");

    const newAccessToken = await this.jwtService.signAsync({
      id: user.id,
      role: user.role,
    });

    return {
      accessToken: newAccessToken,
      u: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  }

  private async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private generateSlug(name: string) {
    const base = name.toLowerCase().replace(/\s+/g, "-");
    const random = this.generate6DigitNumber();

    return `${base}-${random}`;
  }

  private generate6DigitNumber() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
