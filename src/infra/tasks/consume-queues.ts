import { LoggerService } from '@/services/logger.service'
import { AwsSqsService } from '@/services/queue.service'
import { AWS_FIFO_QUEUES, UPDATED_ORDER_QUEUE } from '@/constants/constants'
import { makeUpdateOrderUseCase } from '../factories/usecases/update-order-usecase.factory'
import { SchemaValidator } from '@/shared/helpers/schema-validator.helper'

const logger = new LoggerService()
const schemaValidator = new SchemaValidator()

export const processMessagesOnQueues = async (): Promise<void> => {
  logger.info('Started SQS Pooler')

  const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  while (true) {
    try {
      await Promise.all(AWS_FIFO_QUEUES.map(async (queue) => {
        if (queue === UPDATED_ORDER_QUEUE) {
          await updateOrderStatus()
        }
      }))
    } catch (error) {
      logger.error('Error processing queue message', { error })
    }

    await sleep(5000)
  }
}

export const updateOrderStatus = async (): Promise<any> => {
  const queue = new AwsSqsService()
  const messages = await queue.receiveMessage(UPDATED_ORDER_QUEUE, 1, 20)

  if (!messages) {
    return null
  }

  for (const message of messages) {
    try {
      const { identifier, status } = JSON.parse(message.Body)
      schemaValidator.validate({ identifier, status }, 'updateOrderSchema')
      const updateOrderUseCase = makeUpdateOrderUseCase()
      await updateOrderUseCase.execute(identifier, status)
      await queue.deleteMessage(UPDATED_ORDER_QUEUE, message.ReceiptHandle, message.MessageId)
    } catch (error) {
      logger.error('Error update order status', { error })
      throw error
    }
  }
}
