import { LoggerService } from '@/services/logger.service'
import { AwsSqsService } from '@/services/queue.service'
import { AWS_FIFO_QUEUES } from '@/shared/constants'

const logger = new LoggerService()

export const createQueueFIFO = async (): Promise<void> => {
  try {
    const sqs = new AwsSqsService()
    AWS_FIFO_QUEUES.map(async (queue) => {
      await sqs.createQueueFIFO(queue)
    })
  } catch (error: any) {
    logger.error('Error creating aws fifo queue')
    throw error
  }
}
