import { ApiProperty } from "@nestjs/swagger";
import type { Express } from "express";

export class uploadImageDTO {
  @ApiProperty({
    type: "string",
    format: "binary",
    required: true,
    name: "cv",
  })
  file: Express.Multer.File;
}
