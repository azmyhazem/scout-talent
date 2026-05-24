import { Injectable } from "@nestjs/common";
import sgMail from "@sendgrid/mail";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  constructor(private config: ConfigService) {
    sgMail.setApiKey(this.config.get<string>("SENDGRID_API_KEY")!);
  }

  // Verify Email
  public async sendVerifyEmail(email: string, link: string) {
    const msg = {
      to: email,
      from: this.config.get<string>("SENDGRID_FROM_EMAIL")!,
      templateId: this.config.get<string>("SENDGRID_VERIFY_TEMPLATE_ID")!,
      dynamicTemplateData: {
        link,
      },
    };

    return await sgMail.send(msg);
  }

  // Reset Password
  public async sendResetPassword(email: string, link: string) {
    const msg = {
      to: email,
      from: this.config.get<string>("SENDGRID_FROM_EMAIL")!,
      templateId: this.config.get<string>("SENDGRID_RESET_TEMPLATE_ID")!,
      dynamicTemplateData: {
        link,
      },
    };

    return await sgMail.send(msg);
  }

  // Reset Password
  public async sendRestoreAccount(email: string, link: string) {
    const msg = {
      to: email,
      from: this.config.get<string>("SENDGRID_FROM_EMAIL")!,
      templateId: this.config.get<string>("SENDGRID_RESTORE_TEMPLATE_ID")!,
      dynamicTemplateData: {
        link,
      },
    };

    return await sgMail.send(msg);
  }
}
