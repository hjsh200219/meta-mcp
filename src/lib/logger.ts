import pino from 'pino';

export function createLogger(level: string) {
  return pino({
    level,
    redact: ['accessToken', 'authorization', 'META_ACCESS_TOKEN', 'MCP_AUTH_TOKEN'],
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

export type Logger = pino.Logger;
