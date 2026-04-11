import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class addSpecializationDTO {
  @IsString()
  @ApiProperty()
  name!: string;
}
