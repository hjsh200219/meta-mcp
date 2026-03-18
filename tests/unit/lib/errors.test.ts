import { describe, it, expect } from 'vitest';
import {
  MetaMcpError,
  MetaApiError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  ConfigurationError,
  toMcpError,
} from '../../../src/lib/errors.js';

describe('MetaMcpError', () => {
  it('constructor_메시지설정_인스턴스생성', () => {
    const error = new MetaMcpError('test error');
    expect(error.message).toBe('test error');
    expect(error.name).toBe('MetaMcpError');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('MetaApiError', () => {
  it('constructor_MetaAPI에러정보_올바른파싱', () => {
    const error = new MetaApiError('Campaign not found', 100, 33, 'trace123');
    expect(error.message).toBe('Campaign not found');
    expect(error.code).toBe(100);
    expect(error.subcode).toBe(33);
    expect(error.fbtraceId).toBe('trace123');
    expect(error).toBeInstanceOf(MetaMcpError);
  });

  it('fromResponse_MetaAPI에러응답_MetaApiError변환', () => {
    const response = {
      error: {
        message: 'Invalid parameter',
        code: 100,
        error_subcode: 1487851,
        fbtrace_id: 'abc123',
      },
    };
    const error = MetaApiError.fromResponse(response);
    expect(error.message).toBe('Invalid parameter');
    expect(error.code).toBe(100);
    expect(error.subcode).toBe(1487851);
    expect(error.fbtraceId).toBe('abc123');
  });
});

describe('AuthenticationError', () => {
  it('constructor_인증에러_MetaMcpError상속', () => {
    const error = new AuthenticationError('Token expired');
    expect(error.message).toBe('Token expired');
    expect(error.name).toBe('AuthenticationError');
    expect(error).toBeInstanceOf(MetaMcpError);
  });
});

describe('RateLimitError', () => {
  it('constructor_retryAfter포함_올바른설정', () => {
    const error = new RateLimitError('Rate limit exceeded', 30);
    expect(error.message).toBe('Rate limit exceeded');
    expect(error.retryAfterSeconds).toBe(30);
    expect(error).toBeInstanceOf(MetaMcpError);
  });
});

describe('ValidationError', () => {
  it('constructor_검증에러_올바른설정', () => {
    const error = new ValidationError('Invalid budget');
    expect(error.message).toBe('Invalid budget');
    expect(error).toBeInstanceOf(MetaMcpError);
  });
});

describe('ConfigurationError', () => {
  it('constructor_설정에러_올바른설정', () => {
    const error = new ConfigurationError('Missing META_ACCESS_TOKEN');
    expect(error.message).toBe('Missing META_ACCESS_TOKEN');
    expect(error).toBeInstanceOf(MetaMcpError);
  });
});

describe('toMcpError', () => {
  it('MetaMcpError입력_isError응답변환', () => {
    const error = new MetaApiError('Budget too low', 100, 0, 'trace1');
    const result = toMcpError(error);
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Budget too low');
    expect(result.content[0].text).toContain('100');
  });

  it('일반Error입력_일반에러메시지변환', () => {
    const error = new Error('Unknown error');
    const result = toMcpError(error);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Unknown error');
  });
});
