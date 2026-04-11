import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDefined,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { InterviewNextStep } from "src/Shared/Enums/Interview.enum";
import { InterviewDTO } from "../../application/dto/interview.dto";
import { JobOfferDTO } from "../../application/dto/jobOffer.dto";
import { RejectDTO } from "../../application/dto/reject.dto";

export class completeInterviewDTO {
  @IsString()
  @ApiProperty()
  publicFeedback: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty()
  rating: number;

  @IsString()
  @ApiProperty()
  nextStep: InterviewNextStep;

  @ValidateIf((o) => o.nextStep === InterviewNextStep.ANOTHERINTERVIEW)
  @IsDefined()
  @ValidateNested()
  @Type(() => InterviewDTO)
  @ApiProperty({ required: false })
  anotherInterview?: InterviewDTO;

  @ValidateIf((o) => o.nextStep === InterviewNextStep.OFFERED)
  @IsDefined()
  @ValidateNested()
  @Type(() => JobOfferDTO)
  @ApiProperty({ required: false })
  offer?: JobOfferDTO;

  @ValidateIf((o) => o.nextStep === InterviewNextStep.REJECTED)
  @IsDefined()
  @ValidateNested()
  @Type(() => RejectDTO)
  @ApiProperty({ required: false })
  reject?: RejectDTO;
}
