export type QueueRepositoryData = {
  id: string
  paymentIdentifier: string
  message: string
  origin: string
  sentSuccessfully: boolean
  createdAt: Date
}

export interface QueueRepositoryInterface {
  saveQueueMessage: (input: QueueRepositoryData) => Promise<void>
  getWithErrors: () => Promise<QueueRepositoryData [] | null>
  updateSentSuccessfully: (id: string, sentSuccessfully: boolean) => Promise<void>
}
