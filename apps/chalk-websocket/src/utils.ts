import { redisClient } from "@repo/redis/redis";
import { Queue } from "bullmq";
import UUID from "uuid-int";
export const chatQueue = new Queue("chatQueue", {
  connection: {
    host: "redis_server",
    port: 6379,
  },
});

export async function storeShape({
  roomId,
  message,
  userId,
  id,
}: {
  roomId: string;
  message: string;
  userId: string;
  id: number;
}) {
  const chatKey = `chat:${roomId}:messages`;
  await redisClient.rPush(
    chatKey,
    JSON.stringify({
      message,
      userId,
      id,
    })
  );

  await redisClient.expire(chatKey, 3600);
  console.log(`message stored in redis for roomId: ${roomId}`);
}

export const addChatToQueue = async ({
  roomId,
  message,
  userId,
}: {
  roomId: string;
  message: string;
  userId: string;
}) => {
  const generator = UUID(0);
  const id = generator.uuid(); // Temporary message ID

  await chatQueue.add("storeMessage", { roomId, userId, message, id });

  await storeShape({ roomId, message, userId, id });
  console.log(`Chat message added to queue for room Id: ${roomId}`);
};

export const removeChatFromQueue = async ({
  roomId,
  message,
  userId,
}: {
  roomId: string;
  message: string;
  userId: string;
}) => {
  const chatKey = `chat:${roomId}:messages`;
  const messages = await redisClient.lRange(chatKey, 0, -1);

  const updatedMessages = messages.filter((msg) => {
    const parsedMessage = JSON.parse(msg);
  });
};
