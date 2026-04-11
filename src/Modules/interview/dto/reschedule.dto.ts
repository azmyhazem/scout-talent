import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsISO8601, IsNumber, IsOptional, IsString } from "class-validator";

export class rescheduleDTO {
  @IsISO8601({}, { message: "Invalid date format" })
  @IsOptional()
  @ApiPropertyOptional({
    example: "2026-04-01T10:00:00+02:00",
  })
  scheduledAt: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  meetingLink: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  durationMin: number;
}
