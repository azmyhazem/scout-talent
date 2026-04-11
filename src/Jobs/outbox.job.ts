import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Outbox } from "src/Modules/Users/outbox.entity";
import { EVENT_TYPE, STATUS } from "src/Shared/Enums/outbox.enum";
import { MailService } from "src/Shared/Mail/mail.service";
import { mintesToMilliseconds } from "src/Shared/utils/cookie.util";
import { LessThanOrEqual, Repository } from "typeorm";

@Injectable()
export class OutboxService {
  constructor(
    @InjectRepository(Outbox)
    private outboxRepository: Repository<Outbox>,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processOutbox() {
    const now = new Date();

    await this.outboxRepository.update(
      {
        status: STATUS.PENDING,
        nextRetryAt: LessThanOrEqual(now),
      },
      {
        status: STATUS.PROCESSING,
      },
    );
    const messages = await this.outboxRepository.find({
      where: { status: STATUS.PROCESSING, nextRetryAt: LessThanOrEqual(now) },
      take: 10,
      order: { created_at: "asc" },
    });

    for (const msg of messages) {
      const { email, token } = msg.payload;

      try {
        switch (msg.event_type) {
          case EVENT_TYPE.SEND_VERIFICATION_EMAIL: {
            const link = `${this.config.get<string>("EMAIL_VERIFICATION_URL")}?token=${token}`;
            await this.mailService.sendVerifyEmail(email, link);
            break;
          }

          case EVENT_TYPE.SEND_RESET_PASSWORD: {
            const link = `${this.config.get<string>("RESET_PASSWORD_URL")}?token=${token}`;
            await this.mailService.sendResetPassword(email, link);
            break;
          }

          case EVENT_TYPE.SEND_RESTORE_EMAIL: {
            const link = `${this.config.get<string>("RESTORE_ACCOUNT_URL")}?token=${token}`;
            await this.mailService.sendRestoreAccount(email, link);
            break;
          }
        }

        await this.outboxRepository.update(msg.id, { status: STATUS.SENT });
      } catch (err) {
        console.log(err);

        const newRetryCount = msg.retryCount + 1;

        const delay = this.getDelay(newRetryCount);

        const status = newRetryCount >= 3 ? STATUS.FAILED : STATUS.PENDING;

        await this.outboxRepository.update(msg.id, {
          retryCount: newRetryCount,
          status,
          nextRetryAt: new Date(Date.now() + delay),
        });
      }
    }
  }

  private getDelay(retryCount: number): number {
    if (retryCount === 1) return mintesToMilliseconds(1);
    if (retryCount === 2) return mintesToMilliseconds(5);
    if (retryCount === 3) return mintesToMilliseconds(15);

    return mintesToMilliseconds(60);
  }

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async cleanOutbox() {
    const now = new Date();

    const oneDayAgo = new Date(now.getTime() - mintesToMilliseconds(24 * 60));

    await this.outboxRepository.delete({
      status: STATUS.SENT,
      created_at: LessThanOrEqual(oneDayAgo),
    });
  }
}
