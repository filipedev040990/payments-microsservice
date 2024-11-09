import 'module-alias/register'
import { router } from './routes'
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '@/infra/tools/swagger.json'
import { LoggerService } from '@/services/logger.service'
import { createQueueFIFO } from '../tasks/create-queues'
import { resendOrdersToQueueBot } from '../bot/resend-order-to-queue'
import { processMessagesOnQueues } from '../tasks/consume-queues'

const start = async (): Promise<void> => {
  const loggerService = new LoggerService()
  try {
    const app = express()

    app.use(cors())
    app.use(express.json())
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    app.use('/v1', router)

    await createQueueFIFO()
    await resendOrdersToQueueBot()

    const port = process.env.PORT ?? 3000

    app.listen(port, () => loggerService.info(`Server running at port ${port}`))

    await processMessagesOnQueues()
  } catch (error) {
    loggerService.error('Error on bootstrap', { error })
    throw error
  }
}

void start()
