export interface QueueServiceInterface {
  sendMessage: (queueName: string, message: string, messageGroupId: string, messageDeduplicationId: string) => Promise<boolean>
  receiveMessage: (queueName: string, maxNumberOfMessages: number, waitTimeSeconds: number) => Promise<any>
  deleteMessage: (queueName: string, receiptHandle: string, messageId: string) => Promise<void>
  createQueueFIFO: (queueName: string) => Promise<void>
}
