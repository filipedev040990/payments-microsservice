import { LoggerService } from '@/services/logger.service'
import { AwsSqsService } from '@/services/queue.service'
import { CREATED_ORDER_QUEUE } from '@/shared/constants'
import { SchemaValidator } from '@/services/schema-validator.service'
import { ProcessPaymentUseCase } from '@/usecases/process-payment/process-payment.usecase'
import { PaymentGatewayService } from '@/services/payment-gateway.service'
import { PaymentRepository } from '../db/repositories/log-success.repository'
import { UUIDService } from '@/services/uuid.service'
import { QueueRepository } from '../db/repositories/queue-repository'

const logger = new LoggerService()
const schemaValidator = new SchemaValidator()

export const processMessagesOnQueues = async (): Promise<void> => {
  logger.info('Started SQS Pooler')

  const sleep = async (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

  while (true) {
    try {
      await processPayment()
    } catch (error) {
      logger.error('Error processing queue message', { error })
    }
    await sleep(5000)
  }
}

export const processPayment = async (): Promise<any> => {
  const queue = new AwsSqsService()
  const messages = await queue.receiveMessage(CREATED_ORDER_QUEUE, 1, 20)

  if (!messages) {
    return null
  }

  for (const message of messages) {
    try {
      const { identifier, items, totalValue, clientId } = JSON.parse(message.Body)
      const input = { identifier, items, totalValue, clientId }
      schemaValidator.validate(input, 'processPaymentSchema')
      const processPaymentUseCase = makeprocessPaymentUseCase()
      await processPaymentUseCase.execute(input)
      await queue.deleteMessage(CREATED_ORDER_QUEUE, message.ReceiptHandle, message.MessageId)
    } catch (error) {
      logger.error('Error update order status', { error })
      throw error
    }
  }
}

export const makeprocessPaymentUseCase = (): ProcessPaymentUseCase => {
  const paymentGatewayService = new PaymentGatewayService()
  const paymentRepository = new PaymentRepository()
  const uuidService = new UUIDService()
  const queueService = new AwsSqsService()
  const queueRepository = new QueueRepository()
  return new ProcessPaymentUseCase(paymentGatewayService, logger, paymentRepository, uuidService, queueService, queueRepository)
}
