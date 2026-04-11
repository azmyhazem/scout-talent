import { ApiProperty } from "@nestjs/swagger";
import { IsISO8601, IsString } from "class-validator";

export class JobOfferDTO {
  @IsString()
  @ApiProperty()
  offeredSalary: string;

  @IsISO8601({}, { message: "Invalid date format" })
  @ApiProperty({
    example: "2026-04-01T10:00:00+02:00",
  })
  startDate: string;

  @IsISO8601({}, { message: "Invalid date format" })
  @ApiProperty({
    example: "2026-04-01T10:00:00+02:00",
  })
  expiresAt:string

  @IsString()
  @ApiProperty({ required: false })
  notes: string;
}
