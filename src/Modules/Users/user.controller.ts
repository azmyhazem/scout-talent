import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("profile/:slug")
  public async getProfile(@Param("slug") slug: string) {
    const me = await this.userService.findUserBySlug(slug);
    return { data: me };
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @Roles(RoleUser.ADMIN)
  @ApiOperation({
    summary: "Get user by id",
  })
  @ApiParam({
    name: "id",
  })
  @ApiResponse({
    status: 200,
    description: "User retrieved successfully",
  })
  async getUserById(@Param("id") id: string) {
    return this.userService.getUserById(id);
  }
}
