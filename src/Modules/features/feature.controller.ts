import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { FeatureService } from "./feature.service";
import { CreateFeatureDto } from "./dto/create-feature.dto";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { ApiSecurity } from "@nestjs/swagger";

@Controller("features")
export class FeaturesController {
  constructor(private featureService: FeatureService) {}

  @Post("create")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  createFeature(@Body() body: CreateFeatureDto) {
    return this.featureService.createFeature(body);
  }

  @Get("all")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  allFeature() {
    return this.featureService.getAllFeature();
  }
}
