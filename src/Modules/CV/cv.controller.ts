import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
  NotFoundException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import { CVService } from "./cv.service";
import type { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { Roles } from "../../Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { currentUser } from "../../Shared/decorator/currentUser.decorator";
import { ApiBody, ApiConsumes, ApiSecurity } from "@nestjs/swagger";
import { uploadImageDTO } from "./dto/cvUpload.dto";
import type { Response } from "express";
import { join } from "path";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { PermissionGuard } from "../permission/guard/permission.guard";
import { RequirePermission } from "../permission/decorator/permission.decorator";

@UseGuards(AuthGuard, PermissionGuard)
@Controller("cv")
export class CVController {
  constructor(
    private cvService: CVService,
    @InjectQueue("upload-cv")
    private upload_cv: Queue,
  ) {}

  @Post("/upload-cv")
  @Roles(RoleUser.APPLICANT)
  @UseInterceptors(FileInterceptor("cv"))
  @ApiSecurity("bearer")
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: uploadImageDTO })
  @RequirePermission("cv:upload")
  public async uploadCV(
    @currentUser() user: JwtPayloadType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("no file upload");

    const { message, cvId, applicantId, projectId, candidateId } =
      await this.cvService.uploadCV(user.id, file.path, file.originalname);

    await this.upload_cv.add(
      "cv",
      { file, cvId, applicantId, projectId, candidateId },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    );

    return {
      data: {
        message,
        cvId,
      },
    };
  }

  @Get("isPrimary/:cvId")
  @Roles(RoleUser.APPLICANT)
  @RequirePermission("cv:set_primary")
  public async selectPrimaryCV(
    @Param("cvId") cvId: string,
    @currentUser() user: JwtPayloadType,
  ) {
    const data = await this.cvService.selectPrimaryCV(user.id, cvId);
    return { data };
  }

  @Get("download/:cvId")
  @Roles(RoleUser.APPLICANT)
  @RequirePermission("cv:download")
  async downloadFile(@Param("cvId") cvId: string, @Res() res: Response) {
    const { url } = await this.cvService.find(cvId);

    if (!url) {
      throw new NotFoundException("File not found");
    }
    const filePath = join(process.cwd(), url);
    return res.download(filePath);
  }

  @Get("view/:cvId")
  @Roles(RoleUser.APPLICANT)
  @RequirePermission("cv:view")
  async viewFile(@Param("cvId") cvId: string, @Res() res: Response) {
    const { url } = await this.cvService.find(cvId);

    if (!url) {
      throw new NotFoundException("File not found");
    }
    const filePath = join(process.cwd(), url);
    return res.sendFile(filePath);
  }

  @Get("/getAll")
  @Roles(RoleUser.APPLICANT)
  @ApiSecurity("bearer")
  @RequirePermission("cv:get_all")
  public async AllCV(@currentUser() user: JwtPayloadType) {
    const data = await this.cvService.getAllCVFromUser(user.id);

    return { data };
  }

  @Delete("/delete/:id")
  @Roles(RoleUser.APPLICANT)
  @ApiSecurity("bearer")
  @RequirePermission("cv:delete")
  public async deleteCV(
    @currentUser() user: JwtPayloadType,
    @Param("id") id: string,
  ) {
    const data = await this.cvService.deleteCV(user.id, id);

    return { data };
  }
}
