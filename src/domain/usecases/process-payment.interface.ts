export type ProcessPaymentUseCaseInput = {
  identifier: string
  totalValue: number
}

export interface ProcessPaymentUseCaseInterface {
  execute: (input: ProcessPaymentUseCaseInput) => Promise<void>
}


