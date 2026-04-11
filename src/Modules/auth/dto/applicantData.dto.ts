import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ApplicantDataDTO {
  @IsString()
  @ApiProperty()
  phone: string;

  @IsString()
  @ApiProperty()
  job_title: string;
}
