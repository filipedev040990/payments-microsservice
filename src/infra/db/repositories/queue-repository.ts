import { QueueRepositoryData, QueueRepositoryInterface } from '@/domain/repositories/queue-repository.interface'
import { prismaClient } from '../prisma-client'

export class QueueRepository implements QueueRepositoryInterface {
  async saveQueueMessage (data: QueueRepositoryData): Promise<void> {
    await prismaClient.sentMessages.create({ data })
  }

  async getWithErrors (): Promise<QueueRepositoryData[] | null> {
    const messagesWithError = await prismaClient.sentMessages.findMany({
      where: {
        sentSuccessfully: false
      }
    })
    return messagesWithError ?? null
  }

  async updateSentSuccessfully (id: string, sentSuccessfully: boolean): Promise<void> {
    await prismaClient.sentMessages.update({
      data: {
        sentSuccessfully
      },
      where: {
        id
      }
    })
  }
}
