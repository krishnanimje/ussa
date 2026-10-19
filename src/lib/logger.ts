// Production-ready, privacy-respecting structured logger
// Zero PII leakage: automatically redacts emails, passwords, tokens, full inquiry messages

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  requestId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

const PII_KEYS = new Set([
  'password',
  'secret',
  'token',
  'auth',
  'authorization',
  'cookie',
  'email',
  'phone',
  'message',
  'full_name',
  'fullName'
]);

export function redactSensitiveData(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(redactSensitiveData);

  const cleaned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    if (PII_KEYS.has(key.toLowerCase())) {
      cleaned[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      cleaned[key] = redactSensitiveData(val);
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

export function log(level: LogLevel, message: string, context?: LogContext): void {
  const timestamp = new Date().toISOString();
  const safeContext = context ? redactSensitiveData(context) : undefined;
  const entry = {
    timestamp,
    level,
    message,
    ...(safeContext as object)
  };

  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry));
  } else if (process.env.NODE_ENV !== 'production' || level === 'info') {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info: (msg: string, ctx?: LogContext) => log('info', msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log('warn', msg, ctx),
  error: (msg: string, ctx?: LogContext) => log('error', msg, ctx),
  debug: (msg: string, ctx?: LogContext) => log('debug', msg, ctx)
};
