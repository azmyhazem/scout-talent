import { Module } from "@nestjs/common";
import { PaymobService } from "./paymob.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

@Module({
  providers: [PaymobService],
  imports: [HttpModule, ConfigModule],
  exports: [PaymobService],
})
export class PaymobModule {}
