import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { RoleUser } from "src/Shared/Enums/user.enum";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { addSkillDTO } from "../Skills/dto/addSkill.dto";
import { Roles } from "../../Shared/decorator/user_role.decorator";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../../Shared/decorator/currentUser.decorator";
import { ApiSecurity } from "@nestjs/swagger";
import { SpecializationService } from "./specialization.service";
import { PermissionGuard } from "../permission/guard/permission.guard";
import { RequirePermission } from "../permission/decorator/permission.decorator";

@UseGuards(PermissionGuard)
@Controller("companys/me")
export class SpecializationController {
  constructor(private specializationService: SpecializationService) {}

  @Post("specializations")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @RequirePermission("specialization:add")
  public async addSpecializations(
    @currentUser() company: JwtPayloadType,
    @Body() body: addSkillDTO,
  ) {
    const data = await this.specializationService.addSpecialization(
      body,
      company.id,
    );
    return { data };
  }

  @Delete("specializations/:id")
  @Roles(RoleUser.COMPANY)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  @RequirePermission("specialization:delete")
  public async deletespecializations(
    @currentUser() company: JwtPayloadType,
    @Param("id") id: string,
  ) {
    const data = await this.specializationService.deleteSkill(id, company.id);
    return { data };
  }
}
