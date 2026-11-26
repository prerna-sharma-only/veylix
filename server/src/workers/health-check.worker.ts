import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";

const healthCheckWorker = new Worker(
  "health-checks",
  async (job) => {
    console.log("Processing job:", job.id);
    console.log("Job data:", job.data);

    return {
      message: "Health check job processed successfully",
      serviceId: job.data.serviceId,
    };
  },
  {
    connection: redisConnection,
    concurrency: 5, //This worker can process up to five jobs simultaneously. It does not mean five workers; it means one worker with a maximum of five concurrent jobs
  },
);

healthCheckWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

healthCheckWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

console.log("Health check worker is running...");