import {
  Body,
  Controller,
  Post,
  Res,
  Req,
  BadRequestException,
  UseGuards,
  Get,
  Param,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { registerDTO } from "./dto/register.dto";
import { loginDTO } from "./dto/login.dto";
import type { Response, Request } from "express";
import { Roles } from "../../Shared/decorator/user_role.decorator";
import { AuthGuard } from "./guards/AuthUser.guard";
import { currentUser } from "../../Shared/decorator/currentUser.decorator";
import { forgetPasswordDTO } from "./dto/forget_password.dto";
import { resetPasswordDTO } from "./dto/reset_password.dto";
import { ApiSecurity } from "@nestjs/swagger";
import { resendEmailVerify } from "./dto/resendEmailVerify.dto";
import { GoogleAuthGuard } from "./guards/google_auth.guard";
import { userRoleDTO } from "./dto/userRole.dto";
import { RoleUser } from "src/Shared/Enums/user.enum";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { requestRestoreDTO } from "./dto/requestRestore.dto";
import { ConfigService } from "@nestjs/config";
import { daysToMilliseconds } from "src/Shared/utils/cookie.util";
import { RefreshTokenGuard } from "./guards/refreshToken.guard";
interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
  };
}
interface GoogleAuth {
  email: string;
  name: string;
}
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post("register")
  public async register(@Body() body: registerDTO) {
    const response = await this.authService.register(body);

    return { data: response };
  }

  @Post("login")
  public async login(
    @Res({ passthrough: true }) res: Response,
    @Body() body: loginDTO,
  ) {
    const { message, accessToken, refreshToken, u } =
      await this.authService.login(body);

    let maxAge = 0;
    if (body.rememberMe) {
      maxAge = daysToMilliseconds(30);
    } else {
      maxAge = daysToMilliseconds(7);
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge,
    });

    return {
      data: { message, accessToken, user: u },
    };
  }

  @Post("resendEmailVerify")
  public async resendEmailVerify(@Body() body: resendEmailVerify) {
    const msg = await this.authService.resendEmailVerify(body);
    return {
      data: msg,
    };
  }

  @Post("refreshToken")
  @UseGuards(RefreshTokenGuard)
  public async getAccessToken(@Req() req: RequestWithCookies) {
    const { refreshToken } = req.cookies;

    if (!refreshToken) throw new BadRequestException("no refresh token");

    const data = await this.authService.getAccessToken(refreshToken);

    return { data };
  }

  @Post("logOut")
  @Roles(RoleUser.APPLICANT, RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async logOut(
    @currentUser() user: JwtPayloadType,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logOut(user.id);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return { data: { msg: "log out successful" } };
  }

  @Get("verify-email/:token")
  public async verifyEmail(@Param("token") token: string) {
    const data = await this.authService.verifyEmail(token);
    return { data };
  }

  @Post("forget-password")
  public async forgetPassword(@Body() body: forgetPasswordDTO) {
    const msg = await this.authService.forgetPassword(body);
    return { data: msg };
  }

  @Post("reset_password/:token")
  public async resetPassword(
    @Param("token") token: string,
    @Body() body: resetPasswordDTO,
  ) {
    const msg = await this.authService.resetPassword(body, token);
    return {
      data: msg,
    };
  }

  @Post("restore/request")
  public async RequestRestore(@Body() body: requestRestoreDTO) {
    const msg = await this.authService.requestRestore(body);
    return { data: msg };
  }

  @Post("restore/confrim/:token")
  public async ConfirmRestore(@Param("token") token: string) {
    return this.authService.confirmRestore(token);
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  public async googleAuthRedirect(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { email, name } = req.user as GoogleAuth;

    if (!email || !name)
      throw new BadRequestException("something false, please try again");

    const { needRole, token, userId } = await this.authService.GoogleAuth(
      email,
      name,
    );

    if (needRole && userId && !token) {
      return res.redirect(
        `${this.config.get<string>("SELECT_ROLE_URL")}?id=${userId}`,
      );
    }

    res.cookie("refreshToken", token?.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: daysToMilliseconds(30),
    });

    return res.redirect(`${this.config.get<string>("HOME_URL")}`);
  }

  @Post("select-role/:id")
  public async userRole(
    @Res({ passthrough: true }) res: Response,
    @Body() body: userRoleDTO,
    @Param("id") id: string,
  ) {
    const { message, refreshToken, accessToken, u } =
      await this.authService.SelectRoleUser(body, id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: daysToMilliseconds(30),
    });

    return {
      data: { message, accessToken, user: u },
    };
  }

  @Post("getMe")
  @UseGuards(RefreshTokenGuard)
  public async getMe(@Req() req: RequestWithCookies) {
    const { refreshToken } = req.cookies;

    if (!refreshToken) throw new BadRequestException("no refresh token");

    const data = await this.authService.getMe(refreshToken);

    return { data };
  }
}
