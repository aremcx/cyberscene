/**
 * Logger Utility
 * Centralized logging with levels, context, and structured output.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  message: string;
  context?: Record<string, unknown>;
}

let currentLevel: LogLevel = LogLevel.INFO;
const logBuffer: LogEntry[] = [];
const MAX_BUFFER_SIZE = 1000;

function addToBuffer(entry: LogEntry): void {
  logBuffer.push(entry);
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }
}

function formatEntry(entry: LogEntry): string {
  const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
  return `[${entry.timestamp}] [${entry.level}] [${entry.module}] ${entry.message}${context}`;
}

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLevel;
}

export function getLogBuffer(): LogEntry[] {
  return [...logBuffer];
}

export function clearLogBuffer(): void {
  logBuffer.length = 0;
}

/**
 * Create a logger for a specific module
 */
export function createLogger(module: string) {
  function log(level: LogLevel, levelName: string, message: string, context?: Record<string, unknown>): void {
    if (level < currentLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: levelName,
      module,
      message,
      context,
    };

    addToBuffer(entry);

    const formatted = formatEntry(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  return {
    debug(message: string, context?: Record<string, unknown>): void {
      log(LogLevel.DEBUG, 'DEBUG', message, context);
    },

    info(message: string, context?: Record<string, unknown>): void {
      log(LogLevel.INFO, 'INFO', message, context);
    },

    warn(message: string, context?: Record<string, unknown>): void {
      log(LogLevel.WARN, 'WARN', message, context);
    },

    error(message: string, context?: Record<string, unknown>): void {
      log(LogLevel.ERROR, 'ERROR', message, context);
    },

    /**
     * Log an error from an exception
     */
    exception(error: Error, context?: Record<string, unknown>): void {
      log(LogLevel.ERROR, 'ERROR', error.message, {
        ...context,
        stack: error.stack,
        name: error.name,
      });
    },

    /**
     * Time an operation
     */
    async time<T>(operation: string, fn: () => Promise<T>): Promise<T> {
      const start = performance.now();
      try {
        const result = await fn();
        const duration = Math.round(performance.now() - start);
        this.info(`${operation} completed`, { duration: `${duration}ms` });
        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - start);
        this.error(`${operation} failed`, { duration: `${duration}ms` });
        throw error;
      }
    },
  };
}

// Pre-built loggers for common modules
export const logger = {
  db: createLogger('Database'),
  auth: createLogger('Auth'),
  api: createLogger('API'),
  service: createLogger('Service'),
  security: createLogger('Security'),
};
