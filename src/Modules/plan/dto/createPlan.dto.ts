import { Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PlanPermissionDto } from "./planPermission.dto";

export class CreatePlanDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsNumber()
  durationInDays: number;

  @ApiProperty({
    type: [PlanPermissionDto],
  })
  @ValidateNested({ each: true })
  @Type(() => PlanPermissionDto)
  permissions: PlanPermissionDto[];
}
