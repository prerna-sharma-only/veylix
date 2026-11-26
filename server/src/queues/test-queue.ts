import { healthCheckQueue } from "./health-check.queue.js";

const addTestJob = async () => {
  const job = await healthCheckQueue.add("test-health-check", {
    serviceId: "demo-service-123",
    url: "https://example.com",
  });

  console.log("Job added to queue:", job.id);

  await healthCheckQueue.close();
};

addTestJob().catch(console.error);

// healthCheckQueue.add() creates a job and stores it in Redis.
// "test-health-check" is the job name.
// The object is the job's data.
// BullMQ assigns the job an ID.
// The worker listening to the same queue can pick it up.