import { RedisOptions } from "bullmq";

export const redisConnection: RedisOptions = {
  host: "127.0.0.1",
  port: 6379,
};
// host: Redis is running locally on your machine.
// port: Redis uses port 6379 by default.
// redisConnection: a reusable configuration that our queues and workers can share.