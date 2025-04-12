import { createClient, RedisClientType } from "redis";
require("dotenv").config();

console.log(process.env.HOSTNAME, "hostname");
const redisClient: RedisClientType = createClient({
  socket: {
    host: "redis_server",
    port: 6379,
  },
});

redisClient.on("error", (err) => {
  console.log("Redis client error: ", err);
});

(async () => {
  try {
    await redisClient.connect();
    console.log("Redis client connected successfully");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
})();

export { redisClient };
