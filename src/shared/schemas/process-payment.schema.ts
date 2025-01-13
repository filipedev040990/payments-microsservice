import { z } from 'zod'

export const processPaymentSchema = z.object({
  identifier: z.string(),
  items: z.string(),
  totalValue: z.number().positive(),
  clientId: z.string()
})
