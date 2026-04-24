import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Notification } from "./notification.entity";
import { EntityManager, Repository } from "typeorm";
import { RedisService } from "./redis.service";
import { createNotificationDTO } from "./dto/createnotification.dto";

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private redisService: RedisService,
  ) {}

  async create(
    userId: string,
    data: createNotificationDTO,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Notification)
      : this.notificationRepo;

    const notification = repo.create(data);

    await repo.save(notification);

    this.redisService.publish("notification", { userId, data });

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
