import { forwardRef, Module } from "@nestjs/common";
import { CVController } from "./cv.controller";
import { CVService } from "./cv.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CV } from "./cv.entity";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { UserModule } from "../Users/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ApplicantModule } from "../applicant/applicant.module";
import { QueueModule } from "src/queue/queue.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  controllers: [CVController],
  providers: [CVService],
  imports: [
    forwardRef(() => UserModule),
    JwtModule,
    forwardRef(()=>ApplicantModule),
    TypeOrmModule.forFeature([CV]),
    MulterModule.register({
      storage: diskStorage({
        destination: "./FileCV",
        filename: (req, file, cb) => {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype !== "application/pdf" ||
          !file.originalname.match(/\.(pdf)$/)
        ) {
          return cb(new Error("Only PDF files are allowed"), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
    forwardRef(()=>NotificationModule),
    forwardRef(() => QueueModule),
  ],
  exports: [CVService],
})
export class CVModule {}
