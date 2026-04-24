import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtPayloadType } from "src/Shared/types/JwtPayloadType";
import { RedisService } from "./redis.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  private users = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private redisService: RedisService,
  ) {}

  afterInit(server: Server) {
    console.log("Gateway initialized");

    setTimeout(() => {
      this.redisService.subscribe("notification", (data) => {
        console.log(data)
        this.sendNotification(data.userId, data.content);
      });
    }, 1000);
  }

  async handleConnection(client: Socket) {
    try {
      const userId = await this._extractAndVerifyToken(client);

      if (!userId) {
        console.log("❌ Invalid token");
        client.disconnect();
        return;
      }

      if (!this.users.has(userId)) {
        this.users.set(userId, new Set());
      }

      this.users.get(userId)!.add(client.id);

      (client as any).user = userId;

      console.log(`✅ User connected: ${userId} | Socket: ${client.id}`);
    } catch (error) {
      console.log("❌ Connection error");
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    let disconnectedUserId: string | null = null;

    this.users.forEach((sockets, userId) => {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);

        disconnectedUserId = userId;

        if (sockets.size === 0) {
          this.users.delete(userId);
        }
      }
    });

    console.log(
      `🔌 User disconnected: ${disconnectedUserId} | Socket: ${client.id}`,
    );
  }

  sendNotification(userId: string, data: any) {
    const socket = this.users.get(userId);

    if (!socket || socket.size === 0) {
      console.log(`⚠️ User ${userId} is offline`);
      return;
    }

    socket.forEach((socketId) => {
      this.server.to(socketId).emit("notification", data);
    });

    console.log(`📩 Notification sent to user ${userId}`);
  }

  private async _extractAndVerifyToken(client: Socket) {
    const token = client.handshake.auth?.token;

    if (!token) {
      console.log("No Token provided");
      return null;
    }

    try {
      const payload: JwtPayloadType = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>("JWT_Access_SECRET"),
      });

      return payload.id;
    } catch (err) {
      return null;
    }
  }
}
