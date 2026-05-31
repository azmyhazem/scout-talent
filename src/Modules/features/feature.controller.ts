import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { FeatureService } from "./feature.service";
import { CreateFeatureDto } from "./dto/create-feature.dto";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { ApiSecurity } from "@nestjs/swagger";
import { UpdateFeatureDto } from "./dto/update-feature.dto";

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

  @Get("/:id")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  getFeature(@Param("id") id: string) {
    return this.featureService.getFeatureById(id);
  }

  @Patch("/:id")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  updateFeature(@Param("id") id: string, @Body() body: UpdateFeatureDto) {
    return this.featureService.update(id, body);
  }

  @Delete("/:id")
  @Roles(RoleUser.ADMIN)
  @UseGuards(AuthGuard)
  @ApiSecurity("bearer")
  deleteFeature(@Param("id") id: string) {
    return this.featureService.delete(id);
  }
}
