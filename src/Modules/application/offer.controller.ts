import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApplicationService } from "./application.service";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { ApiSecurity } from "@nestjs/swagger";
import { currentUser } from "src/Shared/decorator/currentUser.decorator";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { offerRespones } from "./dto/offerRespones.dto";
import { PermissionGuard } from "../permission/guard/permission.guard";
import { RequirePermission } from "../permission/decorator/permission.decorator";

@UseGuards(AuthGuard,PermissionGuard)
@Controller("offer")
export class OfferController {
  constructor(private applicationService: ApplicationService) {}

  @Patch("response/:offerId")
  @Roles(RoleUser.APPLICANT)
  @ApiSecurity("bearer")
  @RequirePermission("offer:respond_to_offer")
  public async offerRespones(
    @Param("offerId") offerId: string,
    @currentUser() user: JwtPayloadType,
    @Body() body: offerRespones,
  ) {
    return this.applicationService.jobOfferRespones(user.id, offerId, body);
  }

  @Get("all/applicant")
  @Roles(RoleUser.APPLICANT)
  @ApiSecurity("bearer")
  @RequirePermission("offer:get_all_by_applicant")
  public async allOfferByApplicant(@currentUser() user: JwtPayloadType) {
    return this.applicationService.allOfferByApplicant(user.id);
  }

  @Get("all/company")
  @Roles(RoleUser.COMPANY)
  @ApiSecurity("bearer")
  @RequirePermission("offer:get_all_by_company")
  public async allOfferByCompany(@currentUser() user: JwtPayloadType) {
    const data = await this.applicationService.allOfferByCompany(user.id);
    return { data };
  }
}
