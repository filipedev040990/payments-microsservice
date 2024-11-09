export const ORDER_STATUS = Object.freeze({
  WAITING_PAYMENT: 'waitingPayment',
  CANCELED: 'canceled',
  PROCESSING: 'processing',
  PAID: 'paid',
  UNPAID: 'unpaid'
} as const)

export const PREPARE_ORDER_QUEUE = 'prepare_order.fifo'
export const UPDATED_ORDER_QUEUE = 'updated_order.fifo'
export const AWS_FIFO_QUEUES = [PREPARE_ORDER_QUEUE, UPDATED_ORDER_QUEUE]
