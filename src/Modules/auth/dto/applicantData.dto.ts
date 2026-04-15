import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { IndustryName } from "src/Shared/Enums/industry.enum";

export class ApplicantDataDTO {
  @IsString()
  @ApiProperty()
  phone: string;

  @IsString()
  @ApiProperty()
  job_title: string;

  @IsEnum(IndustryName, { message: "Invalid industry value" })
  @ApiProperty({ enum: IndustryName })
  industry: IndustryName;
}
