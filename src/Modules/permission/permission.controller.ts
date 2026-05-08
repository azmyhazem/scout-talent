import { Controller, Get, UseGuards } from "@nestjs/common";
import { PermissionService } from "./permission.service";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { ApiSecurity } from "@nestjs/swagger";

@Controller("permission")
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Get("all")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  async getAllPermission() {
    return this.permissionService.getAll();
  }
}
