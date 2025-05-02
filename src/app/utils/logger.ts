import { env } from '../config/env'
import { captureError } from './analytics'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
}

class Logger {
  private static instance: Logger
  private logBuffer: LogEntry[] = []
  private readonly MAX_BUFFER_SIZE = 100

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const logEntry = this.formatMessage(level, message, context)

    // In development, log to console
    if (env.NODE_ENV !== 'production') {
      const consoleMethod = level === 'debug' ? 'log' : level
      console[consoleMethod](
        `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`,
        context || ''
      )
      return
    }

    // In production, buffer logs and handle errors
    this.logBuffer.push(logEntry)
    if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
      this.flush()
    }

    // Send errors to error tracking
    if (level === 'error') {
      captureError(message, context)
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (env.NODE_ENV !== 'production') {
      this.log('debug', message, context)
    }
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context)
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context)
  }

  flush(): void {
    if (this.logBuffer.length === 0) return

    // In production, you might want to send logs to a logging service
    if (env.NODE_ENV === 'production') {
      // TODO: Implement log shipping to a service like CloudWatch or Logstash
      this.logBuffer = []
    }
  }
}

export const logger = Logger.getInstance()