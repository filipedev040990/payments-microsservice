type LogProccessBase = {
  id: string
  identifier: string
  totalValue: number
  createdAt: Date
  updatedAt?: Date
}

export type LogProccessPaymentRepositoryData = LogProccessBase & {
  response: string
}

export type LogErrorPaymentRepositoryData = LogProccessBase & {
  error: string
}

export interface PaymentRepositoryInterface {
  logSuccessProcessPayment: (input: LogProccessPaymentRepositoryData) => Promise<void>
  logErrorProcessPayment: (input: LogErrorPaymentRepositoryData) => Promise<void>
}
