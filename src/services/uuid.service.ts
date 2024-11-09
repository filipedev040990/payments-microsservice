import { UUIDServiceInterface } from '@/interfaces/services/uuid-service.interface'
import { randomUUID } from 'crypto'

export class UUIDService implements UUIDServiceInterface {
  generate (): string {
    return randomUUID()
  }
}
