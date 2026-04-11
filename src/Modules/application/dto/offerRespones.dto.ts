import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { OfferStatus } from "src/Shared/Enums/offerStatus.enum";

export class offerRespones {
  @IsString()
  @ApiProperty()
  status: OfferStatus;
}
