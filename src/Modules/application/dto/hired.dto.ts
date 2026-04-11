import { ApiProperty } from "@nestjs/swagger";
import { IsISO8601 } from "class-validator";

export class HiredDTO {
  @IsISO8601({}, { message: "Invalid date format" })
  @ApiProperty({
    example: "2026-04-01T10:00:00+02:00",
  })
  startDate: string;
}
