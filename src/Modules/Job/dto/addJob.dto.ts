import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsISO8601, IsNumber, IsString } from "class-validator";
import { IndustryName } from "src/Shared/Enums/industry.enum";
import { JobType, WorkMode } from "src/Shared/Enums/job.enum";
import { Seniority } from "src/Shared/Enums/seniority.enum";

export class addJobDTO {
  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  location: string;

  @IsNumber()
  @ApiProperty()
  minSalary: number;

  @IsNumber()
  @ApiProperty()
  maxSalary: number;

  @IsString()
  @ApiProperty()
  type: JobType;

  @IsString()
  @ApiProperty()
  workMode: WorkMode;

  @IsString()
  @ApiProperty()
  description: string;

  @IsArray()
  @ApiProperty()
  skills: string[];

  @IsArray()
  @ApiProperty()
  responsibilities: string[];

  @IsString()
  @ApiProperty()
  requirements: string;

  @IsString()
  @ApiProperty()
  seniority: Seniority;

  @IsNumber()
  @ApiProperty()
  positions: number;

  @IsNumber()
  @ApiProperty({ required: false })
  maxApplications: number;

  @IsISO8601({}, { message: "Invalid date format" })
  @ApiProperty({
    example: "2026-04-01T10:00:00+02:00",
  })
  deadline: string;

  @IsEnum(IndustryName, { message: "Invalid industry value" })
  @ApiProperty({ enum: IndustryName })
  industry: IndustryName;
}
