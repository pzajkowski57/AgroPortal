import { Queue, Worker, Processor, WorkerOptions, QueueOptions } from 'bullmq'
import { redis } from './redis'

export const QUEUES = {
  LISTING_EXPIRY: 'listing-expiry',
  MONTHLY_ORDERS: 'monthly-orders',
  EMAIL: 'email',
} as const

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES]

const redisConnection = redis

export function createQueue(name: QueueName, options?: Omit<QueueOptions, 'connection'>): Queue {
  return new Queue(name, {
    ...options,
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  })
}

export function createWorker<T = unknown, R = unknown>(
  name: QueueName,
  processor: Processor<T, R>,
  options?: Omit<WorkerOptions, 'connection'>,
): Worker<T, R> {
  const worker = new Worker<T, R>(name, processor, {
    ...options,
    concurrency: options?.concurrency ?? 5,
    connection: redisConnection,
  })

  worker.on('error', (err) => console.error('[BullMQ Worker Error]', err))

  return worker
}
