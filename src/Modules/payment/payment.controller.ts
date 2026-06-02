import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  UseGuards,
  Param,
} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { AuthGuard } from "../auth/guards/AuthUser.guard";
import { Roles } from "src/Shared/decorator/user_role.decorator";
import { RoleUser } from "src/Shared/Enums/user.enum";

@Controller("admin/payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("webhook")
  handleWebhook(@Body() body: any, @Query("hmac") hmac: string) {
    return this.paymentService.processWebhook(body, hmac);
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(RoleUser.ADMIN)
  @ApiOperation({
    summary: "Get payments with pagination and filters",
  })
  @ApiQuery({
    name: "page",
    required: false,
  })
  @ApiQuery({
    name: "limit",
    required: false,
  })
  @ApiQuery({
    name: "search",
    required: false,
  })
  @ApiQuery({
    name: "status",
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: "Payments retrieved successfully",
  })
  async getPayments(
    @Query("page") page = "1",
    @Query("limit") limit = "6",
    @Query("search") search?: string,
    @Query("status") status?: string,
  ) {
    return this.paymentService.getPayments(
      Number(page) || 1,
      Number(limit) || 6,
      search,
      status,
    );
  }

  @Get("stats")
  @UseGuards(AuthGuard)
  @Roles(RoleUser.ADMIN)
  @ApiOperation({
    summary: "Get payments statistics",
  })
  @ApiResponse({
    status: 200,
    description: "Payments statistics retrieved successfully",
  })
  async getPaymentStats() {
    return this.paymentService.getPaymentStats();
  }

  @Get(":paymentId")
  @ApiOperation({
    summary: "Get payment details by id",
  })
  @ApiParam({
    name: "paymentId",
  })
  @ApiResponse({
    status: 200,
    description: "Payment details retrieved successfully",
  })
  async getPaymentById(@Param("paymentId") paymentId: string) {
    return this.paymentService.getPaymentById(paymentId);
  }
}
