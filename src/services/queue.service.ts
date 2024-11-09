import { QueueServiceInterface } from '@/interfaces/services/queue.service.interface'
import { CreateQueueCommand, CreateQueueRequest, DeleteMessageCommand, DeleteMessageRequest, ReceiveMessageCommand, ReceiveMessageRequest, SendMessageCommand, SendMessageRequest, SQSClient } from '@aws-sdk/client-sqs'
import { LoggerService } from './logger.service'

export class AwsSqsService implements QueueServiceInterface {
  private readonly client: SQSClient
  private readonly logger: LoggerService

  constructor () {
    this.client = this.getClient()
    this.logger = new LoggerService()
  }

  async sendMessage (queueName: string, message: string, messageGroupId: string, messageDeduplicationId: string): Promise<boolean> {
    const input: SendMessageRequest = {
      QueueUrl: `${process.env.AWS_SQS_URL!}${queueName}`,
      MessageBody: message,
      MessageGroupId: messageGroupId,
      MessageDeduplicationId: messageDeduplicationId
    }

    const command = new SendMessageCommand(input)
    const sendMessage = await this.client.send(command)

    return !!sendMessage
  }

  async receiveMessage (queueName: string, maxNumberOfMessages: number, waitTimeSeconds: number): Promise<any> {
    const input: ReceiveMessageRequest = {
      QueueUrl: `${process.env.AWS_SQS_URL!}${queueName}`,
      MaxNumberOfMessages: maxNumberOfMessages,
      WaitTimeSeconds: waitTimeSeconds,
      AttributeNames: ['All']
    }

    const command = new ReceiveMessageCommand(input)
    const messages = await this.client.send(command)

    if (messages?.Messages) {
      this.logger.info('Received message:', { message: messages.Messages[0].Body })
      return messages.Messages
    }

    return null
  }

  async deleteMessage (queueName: string, receiptHandle: string, messageId: string): Promise<void> {
    const input: DeleteMessageRequest = {
      QueueUrl: `${process.env.AWS_SQS_URL!}${queueName}`,
      ReceiptHandle: receiptHandle
    }

    const command = new DeleteMessageCommand(input)
    this.logger.info(`Deleting message: ${messageId}`)

    await this.client.send(command)
  }

  async createQueueFIFO (queueName: string): Promise<void> {
    const input: CreateQueueRequest = {
      QueueName: queueName,
      Attributes: {
        FifoQueue: 'true',
        ContentBasedDeduplication: 'true'
      }
    }

    const command = new CreateQueueCommand(input)
    await this.client.send(command)

    this.logger.info(`Created Queue: ${queueName}`)
  }

  private getClient (): SQSClient {
    return new SQSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_KEY!
      }
    })
  }
}
