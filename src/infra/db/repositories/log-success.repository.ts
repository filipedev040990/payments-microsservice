import { LogErrorPaymentRepositoryData, LogProccessPaymentRepositoryData, PaymentRepositoryInterface } from '@/domain/repositories/payment-repository.interface'
import { prismaClient } from '../prisma-client'

export class PaymentRepository implements PaymentRepositoryInterface {
  async logSuccessProcessPayment (input: LogProccessPaymentRepositoryData): Promise<void> {
    await prismaClient.successLog.create({
      data: {
        id: input.id,
        identifier: input.identifier,
        response: input.response,
        totalValue: input.totalValue,
        createdAt: input.createdAt,
        updatedAt: input.createdAt
      }
    })
  }

  async logErrorProcessPayment (input: LogErrorPaymentRepositoryData): Promise<void> {
    await prismaClient.errorLog.create({
      data: {
        id: input.id,
        identifier: input.identifier,
        error: input.error,
        totalValue: input.totalValue,
        createdAt: input.createdAt,
        updatedAt: input.createdAt
      }
    })
  }
}
