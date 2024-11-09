export type ProcessPaymentUseCaseInput = {
  identifier: string
  items: string
  totalValue: number
  clientId: string
}

export interface ProcessPaymentUseCaseInterface {
  execute: (input: ProcessPaymentUseCaseInput) => Promise<void>
}
