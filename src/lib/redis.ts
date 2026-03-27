import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379'

const globalForRedis = globalThis as unknown as { redis: Redis }

function createRedisClient(): Redis {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy: (times) => (times > 20 ? null : Math.min(times * 100, 3000)),
  })

  client.on('error', (err) => {
    console.error('[Redis] Connection error:', err)
  })

  client.on('connect', () => {
    console.info('[Redis] Connected successfully')
  })

  client.on('reconnecting', () => {
    console.warn('[Redis] Reconnecting...')
  })

  return client
}

export const redis: Redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis
