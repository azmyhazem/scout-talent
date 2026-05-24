import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ExperienceService } from "./experience.service";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { addExperienceDTO } from "./dto/addExperience.dto";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { updateExperienceDTO } from "./dto/updateExperience.dto";
import { Roles } from "../../Shared/decorator/user_role.decorator";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../../Shared/decorator/currentUser.decorator";
import { ApiSecurity } from "@nestjs/swagger";
import { PermissionGuard } from "../permission/guard/permission.guard";
import { RequirePermission } from "../permission/decorator/permission.decorator";

@UseGuards(AuthGuard,PermissionGuard)
@Controller("applicant/me")
export class ExperienceController {
  constructor(private experienceService: ExperienceService) {}

  @Post("experiences")
  @Roles(RoleUser.APPLICANT)
  @ApiSecurity("bearer")
  @RequirePermission("experience:add")
  public async addExperience(
    @Body() body: addExperienceDTO,
    @currentUser() user: JwtPayloadType,
  ) {
    const data = await this.experienceService.addExperience(body, user.id);
    return { data };
  }

  @Put("experiences/:id")
  @Roles(RoleUser.APPLICANT)
  @ApiSecurity("bearer")
  @RequirePermission("experience:update")
  public async updateExperience(
    @Body() body: updateExperienceDTO,
    @Param("id") id: string,
  ) {
    const data = await this.experienceService.updateExperience(body, id);
    return { data };
  }

  @Delete("experiences/:id")
  @Roles(RoleUser.APPLICANT)
  @ApiSecurity("bearer")
  @RequirePermission("experience:delete")
  public async deleteExperience(
    @Param("id") id: string,
    @currentUser() user: JwtPayloadType,
  ) {
    const data = await this.experienceService.deleteExperience(id, user.id);
    return { data };
  }
}
