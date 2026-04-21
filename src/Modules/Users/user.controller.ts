import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { ApiSecurity } from "@nestjs/swagger";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("profile/:slug")
  @Roles(RoleUser.APPLICANT, RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async getProfile(@Param("slug") slug: string) {
    const me = await this.userService.findUserBySlug(slug);
    return { data: me };
  }
}
