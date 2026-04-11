import { ApiProperty } from "@nestjs/swagger";
import {
  IsISO8601,
  IsNumber,
  IsString,
} from "class-validator";
import { InterviewTypes } from "src/Shared/Enums/Interview.enum";

export class InterviewDTO {
  @IsString()
  @ApiProperty()
  type: InterviewTypes;

  @IsISO8601({}, { message: "Invalid date format" })
  @ApiProperty({
    example: "2026-04-01T10:00:00+02:00",
  })
  scheduledAt: string;

  @IsString()
  @ApiProperty()
  meetingLink: string;

  @IsNumber()
  @ApiProperty()
  durationMin: number;
}
