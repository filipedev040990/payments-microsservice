export type ProcessPaymentGatewayInput = {
  totalValue: number
}

export type ProcessPaymentGatewayOutput = {
  status: string
  reason?: string
}

export interface PaymentGatewayServiceInterface {
  execute: (input: ProcessPaymentGatewayInput) => Promise<ProcessPaymentGatewayOutput>
}
