import { PaymentGatewayServiceInterface, ProcessPaymentGatewayInput, ProcessPaymentGatewayOutput } from '@/domain/services/payment-gateway.service.interface'

export class PaymentGatewayService implements PaymentGatewayServiceInterface {
  async execute (input: ProcessPaymentGatewayInput): Promise<ProcessPaymentGatewayOutput> {
    let response: ProcessPaymentGatewayOutput
    const isPaid = Math.random() < 0.5

    if (isPaid) {
      response = { status: 'paid' }
    } else {
      response = { status: 'unpaid', reason: 'Falha na cobrança' }
    }
    return response
  }
}
