import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { createClient, RedisClientType } from "redis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;

  async onModuleInit() {
    this.publisher = createClient({
        url: process.env.REDIS_URL,
    //   socket: {
    //     host: process.env.REDIS_HOST ?? "localhost",
    //     port: 6379,
    //   },
    });

    this.subscriber = createClient({
        url: process.env.REDIS_URL,
    //   socket: {
    //     host: process.env.REDIS_HOST ?? "localhost",
    //     port: 6379,
    //   },
    });

    await this.publisher.connect();
    await this.subscriber.connect();

    console.log("🟢 Redis connected");
  }

  async publish(channel: string, message: any) {
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, callback: (data: any) => void) {
    if (!this.subscriber) {
      throw new Error("Redis subscriber not initialized");
    }
    await this.subscriber.subscribe(channel, (message) => {
      callback(JSON.parse(message));
    });
  }

  async onModuleDestroy() {
    await this.publisher?.quit();
    await this.subscriber?.quit();
  }
}
