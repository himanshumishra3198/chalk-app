import { createClient, RedisClientType } from "redis";

const redisClient: RedisClientType = createClient({
  socket: {
    host: "localhost",
    port: 6379,
  },
});

redisClient.on("error", (err) => {
  console.log("Redis client error: ", err);
});

(async () => {
  try {
    await redisClient.connect(); // Connect asynchronously
    console.log("Redis client connected successfully");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
})();

export { redisClient };
