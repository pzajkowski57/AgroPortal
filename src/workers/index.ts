import { createQueue, createWorker, QUEUES } from '@/lib/queue'
import { processListingExpiry } from './listing-expiry/processor'

async function main(): Promise<void> {
  const queue = createQueue(QUEUES.LISTING_EXPIRY)

  await queue.add(
    'listing-expiry-daily',
    {},
    {
      jobId: 'listing-expiry-daily',
      repeat: {
        pattern: '0 1 * * *',
      },
    },
  )

  console.info('[Worker] Registered repeatable job: listing-expiry-daily (cron: 0 1 * * *)')

  const worker = createWorker(QUEUES.LISTING_EXPIRY, async (job) => {
    console.info(`[Worker] Processing job: ${job.id ?? 'unknown'}`)
    const result = await processListingExpiry()
    console.info('[Worker] Job complete:', result)
    return result
  }, { concurrency: 1 })

  console.info('[Worker] Listing expiry worker started.')

  async function shutdown(signal: string): Promise<void> {
    console.info(`[Worker] Received ${signal}, shutting down gracefully...`)
    await worker.close()
    await queue.close()
    console.info('[Worker] Shutdown complete.')
    process.exit(0)
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}

main().catch((err: unknown) => {
  console.error('[Worker] Fatal error during startup:', err)
  process.exit(1)
})
