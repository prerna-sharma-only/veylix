import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const healthCheckQueue = new Queue("health-checks", {
  connection: redisConnection,
});