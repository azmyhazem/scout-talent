import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { RoleUser } from "src/Shared/Enums/user.enum";
import { ApplicantDataDTO } from "./applicantData.dto";
import { Type } from "class-transformer";

export class userRoleDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  role: RoleUser;

  @IsString()
  @ApiProperty()
  location: string;

  @IsString()
  @ApiProperty()
  linkedIn_profile: string;

  @ValidateNested()
  @Type(() => ApplicantDataDTO)
  @ApiPropertyOptional()
  applicant?: ApplicantDataDTO;
}
