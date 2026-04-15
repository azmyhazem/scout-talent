import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { IndustryName } from "src/Shared/Enums/industry.enum";

export class updateApplicantDTO {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  location!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  linkedIn_profile!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  phone!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  job_title!: string;

}
