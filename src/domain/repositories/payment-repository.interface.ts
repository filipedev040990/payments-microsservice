export type LogProccessPaymentRepositoryData = {
  id: string
  identifier: string
  totalValue: number
  response: string
  createdAt: Date
  updatedAt?: Date
}

export interface PaymentRepositoryInterface {
  logProcessPayment: (input: LogProccessPaymentRepositoryData) => Promise<void>
}
