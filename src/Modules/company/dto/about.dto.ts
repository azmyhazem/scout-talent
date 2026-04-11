import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class updateoraddAboutDTO {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  About?: string;
}
