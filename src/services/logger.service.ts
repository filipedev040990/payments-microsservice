import { LoggerServiceInterface, LogLevel } from '@/interfaces/services/logger.service.interface'
import pino, { Logger as PinoLogger, LogFn } from 'pino'
import { randomUUID } from 'crypto'

export class LoggerService implements LoggerServiceInterface {
  private readonly uuid: string
  private readonly logger: PinoLogger

  constructor () {
    this.uuid = randomUUID()
    this.logger = pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      }
    })
  }

  private logWithTracking (level: LogLevel, message: string, obj?: object): void {
    const additionalInfo = { uuid: this.uuid, ...obj };
    (this.logger[level] as LogFn)(additionalInfo, message)
  }

  info (message: string, obj?: object): void {
    this.logWithTracking(LogLevel.INFO, message, obj)
  }

  error (message: string, obj?: object): void {
    this.logWithTracking(LogLevel.ERROR, message, obj)
  }

  warn (message: string, obj?: object): void {
    this.logWithTracking(LogLevel.WARN, message, obj)
  }

  debug (message: string, obj?: object): void {
    this.logWithTracking(LogLevel.DEBUG, message, obj)
  }

  trace (message: string, obj?: object): void {
    this.logWithTracking(LogLevel.TRACE, message, obj)
  }
}
