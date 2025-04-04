import { Worker } from "bullmq";
import { prismaClient } from "@repo/db/client";
import { redisClient } from "@repo/redis/redis";

const worker = new Worker(
  "chatQueue",
  async (job) => {
    const { name, data } = job;

    if (name === "storeMessage") {
      const { userId, message, roomId, id } = data;
      const saveChat = await prismaClient.chat.create({
        data: {
          roomId,
          userId,
          message,
        },
      });

      const chatKey = `chat:${roomId}:messages`;
      const messages = await redisClient.lRange(chatKey, 0, -1);
      const updatedMessages = messages.map((msg) => {
        const parsedMessage = JSON.parse(msg);
        if (parsedMessage.id === id) {
          return JSON.stringify({ ...parsedMessage, id: saveChat.id });
        }
        return msg;
      });
      await redisClient.del(chatKey);
      if (updatedMessages.length > 0) {
        for (const message of updatedMessages) {
          await redisClient.rPush(chatKey, message);
        }
      }
      await redisClient.expire(chatKey, 3600);

      console.log(`Persisted chat message for room ${roomId}`);
    } else if (name === "removeMessage") {
      const { message } = data;
      await prismaClient.chat.deleteMany({
        where: {
          message: message,
        },
      });
    }
  },
  {
    connection: {
      host: "redis_server",
      port: 6379,
    },
  }
);
