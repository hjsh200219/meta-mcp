import { describe, it, expect } from 'vitest';
import { createLogger } from '../../../src/lib/logger.js';

describe('createLogger', () => {
  it('기본레벨_pino로거생성', () => {
    const logger = createLogger('info');
    expect(logger).toBeDefined();
    expect(logger.level).toBe('info');
  });

  it('debug레벨_debug로거생성', () => {
    const logger = createLogger('debug');
    expect(logger.level).toBe('debug');
  });

  it('로거_info메서드존재', () => {
    const logger = createLogger('info');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });
});
