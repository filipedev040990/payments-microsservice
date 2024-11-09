export const ORDER_STATUS = Object.freeze({
  WAITING_PAYMENT: 'waitingPayment',
  CANCELED: 'canceled',
  PROCESSING: 'processing',
  PAID: 'paid',
  UNPAID: 'unpaid'
} as const)

export const CREATED_ORDER_QUEUE = 'created_order.fifo'
export const UPDATED_ORDER_QUEUE = 'updated_order.fifo'
export const AWS_FIFO_QUEUES = [CREATED_ORDER_QUEUE, UPDATED_ORDER_QUEUE]
