import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const redis = new IORedis({ host: process.env.REDIS_HOST || 'localhost', port: 6379 });

export const analysisQueue = new Queue('ryb-analysis', { connection: redis });

export const analysisWorker = new Worker('ryb-analysis', async (job) => {
  console.log(`Processing job ${job.id} with depth ${job.data.depth}`);
  // Actual processing handled by orchestrator for demo
  return { status: 'processed', jobId: job.id };
}, { connection: redis });