import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { ApiSecurity } from "@nestjs/swagger";
import { currentUser } from "src/Shared/decorator/currentUser.decorator";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";

@Controller("subscription")
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Post("create/:planId")
  @Roles(RoleUser.APPLICANT, RoleUser.APPLICANT)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  public createSubscription(
    @currentUser() user: JwtPayloadType,
    @Param("planId") planId: string,
  ) {
    return this.subscriptionService.createSubscription(planId, user.id);
  }
}
