import { PaymentRepositoryInterface } from '@/domain/repositories/payment-repository.interface'
import { LoggerServiceInterface } from '@/domain/services/logger.service.interface'
import { PaymentGatewayServiceInterface, ProcessPaymentGatewayOutput } from '@/domain/services/payment-gateway.service.interface'
import { QueueServiceInterface } from '@/domain/services/queue.service.interface'
import { UUIDServiceInterface } from '@/domain/services/uuid-service.interface'
import { ProcessPaymentUseCaseInput, ProcessPaymentUseCaseInterface } from '@/domain/usecases/process-payment.interface'
import { InvalidParamError, MissingParamError, ProcessPaymentError } from '@/services/error.service'
import { ORDER_STATUS, PREPARE_ORDER_QUEUE, UPDATED_ORDER_QUEUE } from '../../../constants'

export class ProcessPaymentUseCase implements ProcessPaymentUseCaseInterface {
  constructor (
    private readonly paymentGatewayService: PaymentGatewayServiceInterface,
    private readonly loggerService: LoggerServiceInterface,
    private readonly paymentRepository: PaymentRepositoryInterface,
    private readonly uuidService: UUIDServiceInterface,
    private readonly queueService: QueueServiceInterface
  ) {}

  async execute (input: ProcessPaymentUseCaseInput): Promise<void> {
    this.validate(input)

    try {
      this.loggerService.info('Sent process payment request', { request: JSON.stringify(input) })
      const response = await this.paymentGatewayService.execute({ totalValue: input.totalValue })
      await this.logSuccessProcessPayment(input.identifier, input.totalValue, response)
      await this.publishMessageOnQueue(input, response)
    } catch (error: any) {
      await this.handleError(input, error)
    }
  }

  private validate (input: ProcessPaymentUseCaseInput): void {
    if (!input.identifier) throw new MissingParamError('identifier')
    if (input.totalValue < 0) throw new InvalidParamError('totalValue')
    if (!input.totalValue) throw new MissingParamError('totalValue')
    if (!input.clientId) throw new MissingParamError('clientId')
    if (!input.items) throw new MissingParamError('items')
  }

  private async handleError (input: ProcessPaymentUseCaseInput, error: Error): Promise<void> {
    this.loggerService.error('Error processing payment', { error: JSON.stringify(error) })

    await this.paymentRepository.logErrorProcessPayment({
      id: this.uuidService.generate(),
      identifier: input.identifier,
      totalValue: input.totalValue,
      error: JSON.stringify(error),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    throw new ProcessPaymentError()
  }

  private async publishMessageOnQueue (input: ProcessPaymentUseCaseInput, response: ProcessPaymentGatewayOutput): Promise<void> {
    const { clientId, identifier, items } = input

    let message: string
    let queueName: string

    if (response.status === ORDER_STATUS.PAID) {
      message = JSON.stringify({ clientId, items })
      queueName = PREPARE_ORDER_QUEUE
    } else {
      message = JSON.stringify({ identifier, status: ORDER_STATUS.CANCELED })
      queueName = UPDATED_ORDER_QUEUE
    }

    try {
      await this.queueService.sendMessage(queueName, message, identifier, identifier)
    } catch (error) {
      this.loggerService.error('Error publish message on queue', { error })
    }
  }

  private async logSuccessProcessPayment (identifier: string, totalValue: number, response: ProcessPaymentGatewayOutput): Promise<void> {
    try {
      await this.paymentRepository.logSuccessProcessPayment({
        id: this.uuidService.generate(),
        identifier,
        totalValue,
        response: JSON.stringify(response),
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } catch (error) {
      this.loggerService.error('Error save log', { error })
    }
  }
}
