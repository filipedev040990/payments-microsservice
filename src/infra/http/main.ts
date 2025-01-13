import 'module-alias/register'
import express from 'express'
import cors from 'cors'
import { LoggerService } from '@/services/logger.service'
import { createQueueFIFO } from '../tasks/create-queues'
import { processMessagesOnQueues } from '../tasks/consume-queues'

const start = async (): Promise<void> => {
  const loggerService = new LoggerService()
  try {
    const app = express()

    app.use(cors())
    app.use(express.json())

    await createQueueFIFO()

    const port = process.env.PORT ?? 3000

    app.listen(port, () => loggerService.info(`Server running at port ${port}`))

    await processMessagesOnQueues()
  } catch (error) {
    loggerService.error('Error on bootstrap', { error })
    throw error
  }
}

void start()
