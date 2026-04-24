import { Controller, Get, UseGuards } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { ApiSecurity } from "@nestjs/swagger";
import { currentUser } from "src/Shared/decorator/currentUser.decorator";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";

@Controller("notification")
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get("all")
  @Roles(RoleUser.APPLICANT, RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public async getAll(@currentUser() user: JwtPayloadType) {
    return this.notificationService.findAll(user.id);
  }
}
