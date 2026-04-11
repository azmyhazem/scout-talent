import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class updateCompanyDTO {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  location?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  linkedIn_profile?: string;
}
