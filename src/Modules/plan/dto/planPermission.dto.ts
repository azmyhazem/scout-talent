import { IsInt, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PlanPermissionDto {
  @ApiProperty()
  @IsUUID()
  featurePermissionId: string;

  @ApiProperty()
  @IsInt()
  limitCount: number;
}