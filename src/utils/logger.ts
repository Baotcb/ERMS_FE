/**
 * Logger Utility
 * Provides consistent logging across the application
 * Only logs in development environment for production safety
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log errors
    if (!this.isDevelopment && level !== 'error') {
      return false;
    }
    return true;
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message), context || '');
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), context || '');
    }
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      // In production, limit logging to message and error stack/message to prevent PII leaks from context
      if (!this.isDevelopment) {
        console.error(this.formatMessage('error', message), error instanceof Error ? error.message : error)
      } else {
        console.error(this.formatMessage('error', message), error || '', context || '')
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), context || '');
    }
  }

  /**
   * Log API requests (only in development)
   */
  api(method: string, endpoint: string, data?: unknown): void {
    if (this.isDevelopment) {
      this.info(`API Request: ${method} ${endpoint}`, data as LogContext);
    }
  }

  /**
   * Log API responses (only in development)
   */
  apiResponse(method: string, endpoint: string, status: number, data?: unknown): void {
    if (this.isDevelopment) {
      const message = `API Response: ${method} ${endpoint} - Status: ${status}`;
      if (status >= 400) {
        this.warn(message, data as LogContext);
      } else {
        this.info(message, data as LogContext);
      }
    }
  }
}

// Export singleton instance
export const logger = new Logger();
