import {
  IsEnum,
  IsNumber,
  IsString,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaymentMethod } from "src/Shared/Enums/payment.enum";

export class CreatePaymentDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

}