import { Injectable } from "@nestjs/common";
import { NotificationGateway } from "./notification.gateway";
import { InjectRepository } from "@nestjs/typeorm";
import { Notification } from "./notification.entity";
import { Repository } from "typeorm";
import { RedisService } from "./redis.service";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private redisService: RedisService,
  ) {}

  async create(userId: string, content: string) {
    const notification = this.notificationRepo.create({
      user: {
        id: userId,
      },
      content,
    });

    await this.notificationRepo.save(notification);

    this.redisService.publish("notification", { userId, content });

    return notification;
  }

  async findAll(userId: string) {
    const notification = await this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
    });

    await this.markAsRead(userId);

    return { data: notification };
  }

  async findUnread(userId: string) {
    return this.notificationRepo.find({
      where: { user: { id: userId }, isRead: false },
    });
  }

  // ✅ mark as read
  async markAsRead(userId: string) {
    await this.notificationRepo.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
  }
}
