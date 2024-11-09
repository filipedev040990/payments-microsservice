import { ProcessPaymentUseCaseInput } from '@/domain/usecases/process-payment.interface'
import { ProcessPaymentUseCase } from './process-payment.usecase'
import { InvalidParamError, MissingParamError, ProcessPaymentError } from '@/services/error.service'
import { PaymentGatewayServiceInterface } from '@/domain/services/payment-gateway.service.interface'
import { LoggerServiceInterface } from '@/domain/services/logger.service.interface'
import { PaymentRepositoryInterface } from '@/domain/repositories/payment-repository.interface'
import { UUIDServiceInterface } from '@/domain/services/uuid-service.interface'
import { QueueServiceInterface } from '@/domain/services/queue.service.interface'
import { mock } from 'jest-mock-extended'
import MockDate from 'mockdate'

const paymentGatewayService = mock<PaymentGatewayServiceInterface>()
const loggerService = mock<LoggerServiceInterface>()
const paymentRepository = mock<PaymentRepositoryInterface>()
const uuidService = mock<UUIDServiceInterface>()
const queueService = mock<QueueServiceInterface>()

let sut: ProcessPaymentUseCase
let input: ProcessPaymentUseCaseInput

beforeAll(() => {
  MockDate.set(new Date())
})

beforeEach(() => {
  sut = new ProcessPaymentUseCase(paymentGatewayService, loggerService, paymentRepository, uuidService, queueService)
  input = {
    identifier: 'anyIdentifier',
    totalValue: 45000,
    clientId: 'AnyCliend',
    items: 'anyItems'
  }
  uuidService.generate.mockReturnValue('anyUUID')
  paymentGatewayService.execute.mockResolvedValue({ status: 'approved' })
})

afterAll(() => {
  jest.clearAllMocks()
  MockDate.reset()
})

describe('ProcessPaymentUseCase', () => {
  test('should throw if identifier is not provided', async () => {
    input.identifier = null as any
    await expect(async () => sut.execute(input)).rejects.toThrowError(new MissingParamError('identifier'))
  })

  test('should throw if totalValue is not provided', async () => {
    input.totalValue = null as any
    await expect(async () => sut.execute(input)).rejects.toThrowError(new MissingParamError('totalValue'))
  })

  test('should throw if clientId is not provided', async () => {
    input.clientId = null as any
    await expect(async () => sut.execute(input)).rejects.toThrowError(new MissingParamError('clientId'))
  })

  test('should throw if items is not provided', async () => {
    input.items = null as any
    await expect(async () => sut.execute(input)).rejects.toThrowError(new MissingParamError('items'))
  })

  test('should throw if a invalid totalValue is provided', async () => {
    input.totalValue = -1
    await expect(async () => sut.execute(input)).rejects.toThrowError(new InvalidParamError('totalValue'))
  })

  test('should call PaymentGatewayService.execute once and with correct input', async () => {
    await sut.execute(input)
    expect(paymentGatewayService.execute).toHaveBeenCalledTimes(1)
    expect(paymentGatewayService.execute).toHaveBeenCalledWith({ totalValue: input.totalValue })
  })

  test('should throw if PaymentGatewayService.execute throws', async () => {
    const error = new Error('Fake error')
    paymentGatewayService.execute.mockImplementationOnce(() => { throw error })
    await expect(async () => sut.execute(input)).rejects.toThrowError(new ProcessPaymentError())
    expect(paymentRepository.logErrorProcessPayment).toHaveBeenCalledWith({
      id: 'anyUUID',
      identifier: input.identifier,
      totalValue: input.totalValue,
      error: JSON.stringify(error),
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })

  test('should call PaymentRepository.logSuccessProcessPayment once and with correct input', async () => {
    await sut.execute(input)
    expect(paymentRepository.logSuccessProcessPayment).toHaveBeenCalledTimes(1)
    expect(paymentRepository.logSuccessProcessPayment).toHaveBeenCalledWith({
      id: 'anyUUID',
      identifier: input.identifier,
      totalValue: input.totalValue,
      response: JSON.stringify({ status: 'approved' }),
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })

  test('should publish message on success', async () => {
    const messageStr = JSON.stringify({ clientId: 'AnyCliend', items: 'anyItems' })
    paymentGatewayService.execute.mockResolvedValue({ status: 'paid' })
    await sut.execute(input)
    expect(queueService.sendMessage).toHaveBeenCalledTimes(1)
    expect(queueService.sendMessage).toHaveBeenCalledWith('prepare_order.fifo', messageStr, input.identifier, input.identifier)
  })
})
