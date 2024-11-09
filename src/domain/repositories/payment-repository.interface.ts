export type LogProccessPaymentRepositoryData = {
  id: string
  identifier: string
  totalValue: number
  response: string
  createdAt: Date
  updatedAt?: Date
}

export type LogErrorPaymentRepositoryData = {
  id: string
  identifier: string
  totalValue: number
  error: string
  createdAt: Date
  updatedAt?: Date
}

export interface PaymentRepositoryInterface {
  logSuccessProcessPayment: (input: LogProccessPaymentRepositoryData) => Promise<void>
  logErrorProcessPayment: (input: LogErrorPaymentRepositoryData) => Promise<void>
}
