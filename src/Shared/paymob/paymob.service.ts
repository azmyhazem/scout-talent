// src/payment/paymob/paymob.service.ts
import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import * as crypto from "crypto";

@Injectable()
export class PaymobService {
  private readonly logger = new Logger(PaymobService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // ─────────────────────────────────────────────
  // STEP 1: Authenticate and get auth token
  // ─────────────────────────────────────────────
  async getAuthToken(): Promise<string> {
    const apiKey = this.configService.get<string>("PAYMOB_API_KEY");

    const { data } = await firstValueFrom(
      this.httpService.post("https://accept.paymob.com/api/auth/tokens", {
        api_key: apiKey,
      }),
    );

    return data.token;
  }

  // ─────────────────────────────────────────────
  // STEP 2: Register an order on Paymob
  // ─────────────────────────────────────────────
  async createOrder(
    authToken: string,
    amountCents: number,
    currency: string = "EGP",
    items: any[] = [],
  ): Promise<{ orderId: string }> {
    const { data } = await firstValueFrom(
      this.httpService.post("https://accept.paymob.com/api/ecommerce/orders", {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency,
        items,
      }),
    );

    return { orderId: data.id };
  }

  // ─────────────────────────────────────────────
  // STEP 3: Generate a payment key
  // ─────────────────────────────────────────────
  async getPaymentKey(
    authToken: string,
    orderId: string,
    amountCents: number,
    billingData: BillingData,
    currency: string = "EGP",
  ): Promise<string> {
    const integrationId = this.configService.get<number>(
      "PAYMOB_INTEGRATION_ID",
    );

    const { data } = await firstValueFrom(
      this.httpService.post(
        "https://accept.paymob.com/api/acceptance/payment_keys",
        {
          auth_token: authToken,
          amount_cents: amountCents,
          expiration: 3600, // key valid for 1 hour
          order_id: orderId,
          billing_data: billingData,
          currency,
          integration_id: integrationId,
          lock_order_when_paid: true,
        },
      ),
    );

    return data.token; // This is the payment key (not auth token)
  }

  // ─────────────────────────────────────────────
  // MAIN METHOD: Full flow — returns iframe URL
  // ─────────────────────────────────────────────
  async initiatePayment(params: {
    amountCents: number;
    currency?: string;
    billingData: BillingData;
    items?: any[];
  }): Promise<{ iframeUrl: string; orderId: string }> {
    const { amountCents, currency = "EGP", billingData, items = [] } = params;

    // Step 1
    const authToken = await this.getAuthToken();

    // Step 2
    const { orderId } = await this.createOrder(
      authToken,
      amountCents,
      currency,
      items,
    );

    // Step 3
    const paymentKey = await this.getPaymentKey(
      authToken,
      orderId,
      amountCents,
      billingData,
      currency,
    );

    // Step 4: Build iframe URL
    const iframeId = this.configService.get<string>("PAYMOB_IFRAME_ID");
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

    return { iframeUrl, orderId };
  }

  // ─────────────────────────────────────────────
  // WEBHOOK: Verify Paymob HMAC signature
  // ─────────────────────────────────────────────
  verifyWebhookHmac(
    webhookData: Record<string, any>,
    receivedHmac: string,
  ): boolean {
    const hmacSecret = this.configService.get<string>("PAYMOB_HMAC_SECRET");

    // Paymob concatenates these fields in this exact order
    const keys = [
      "amount_cents",
      "created_at",
      "currency",
      "error_occured",
      "has_parent_transaction",
      "id",
      "integration_id",
      "is_3d_secure",
      "is_auth",
      "is_capture",
      "is_refund",
      "is_standalone_payment",
      "is_voided",
      "order",
      "owner",
      "pending",
      "source_data.pan",
      "source_data.sub_type",
      "source_data.type",
      "success",
    ];

    const obj = webhookData.obj;

    const concatenated = keys
      .map((key) => {
        // Handle nested keys like source_data.pan
        const parts = key.split(".");
        let val = obj;
        for (const part of parts) val = val?.[part];
        return val ?? "";
      })
      .join("");

    const hash = crypto
      .createHmac("sha512", hmacSecret!)
      .update(concatenated)
      .digest("hex");

    return hash === receivedHmac;
  }

  // ─────────────────────────────────────────────
  // WEBHOOK: Handle transaction result
  // ─────────────────────────────────────────────
  handleWebhook(
    body: any,
    hmac: string,
  ): { success: boolean; orderId: string } {
    const isValid = this.verifyWebhookHmac(body, hmac);

    if (!isValid) {
      throw new BadRequestException("Invalid HMAC — webhook rejected");
    }

    const { success, order, amount_cents } = body.obj;

    // You can emit an event here or call your subscription service
    return { success, orderId: order.id };
  }
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface BillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  apartment: string;
  floor: string;
  street: string;
  building: string;
  city: string;
  country: string;
  state: string;
  postal_code: string;
}
