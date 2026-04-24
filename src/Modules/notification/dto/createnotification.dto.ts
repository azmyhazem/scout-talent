import { NotificationType } from "src/Shared/Enums/notification.enum";
import { NotificationMetaMap } from "../type/meta.type";
import { User } from "src/Modules/Users/user.entity";

export class createNotificationDTO<
  T extends NotificationType = NotificationType,
> {
  type: T;

  body: string;

  meta: NotificationMetaMap[T];

  user: User;
}
