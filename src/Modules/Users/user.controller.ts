import { Controller, Get, Param } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("profile/:slug")
  public async getProfile(@Param("slug") slug: string) {
    const me = await this.userService.findUserBySlug(slug);
    return { data: me };
  }
}
