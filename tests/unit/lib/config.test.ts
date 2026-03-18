import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadAndValidateConfig } from '../../../src/lib/config.js';

describe('loadAndValidateConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('유효한환경변수_설정객체반환', () => {
    process.env.META_ACCESS_TOKEN = 'valid_token_123';
    process.env.MCP_AUTH_TOKEN = 'a'.repeat(32);

    const config = loadAndValidateConfig();
    expect(config.metaAccessToken).toBe('valid_token_123');
    expect(config.mcpAuthToken).toBe('a'.repeat(32));
    expect(config.port).toBe(3000);
    expect(config.metaApiVersion).toBe('v25.0');
    expect(config.logLevel).toBe('info');
  });

  it('META_ACCESS_TOKEN누락_undefined반환', () => {
    process.env.MCP_AUTH_TOKEN = 'a'.repeat(32);
    delete process.env.META_ACCESS_TOKEN;

    const config = loadAndValidateConfig();
    expect(config.metaAccessToken).toBeUndefined();
  });

  it('MCP_AUTH_TOKEN누락_에러발생', () => {
    process.env.META_ACCESS_TOKEN = 'valid_token';
    delete process.env.MCP_AUTH_TOKEN;

    expect(() => loadAndValidateConfig()).toThrow('MCP_AUTH_TOKEN');
  });

  it('커스텀PORT_숫자변환', () => {
    process.env.MCP_AUTH_TOKEN = 'a'.repeat(32);
    process.env.PORT = '8080';

    const config = loadAndValidateConfig();
    expect(config.port).toBe(8080);
  });

  it('META_API_VERSION_커스텀버전설정', () => {
    process.env.MCP_AUTH_TOKEN = 'a'.repeat(32);
    process.env.META_API_VERSION = 'v24.0';

    const config = loadAndValidateConfig();
    expect(config.metaApiVersion).toBe('v24.0');
  });

  it('META_API_VERSION_잘못된형식_에러발생', () => {
    process.env.MCP_AUTH_TOKEN = 'a'.repeat(32);
    process.env.META_API_VERSION = 'invalid';

    expect(() => loadAndValidateConfig()).toThrow('v{number}.{number}');
  });

  it('META_AD_ACCOUNT_ID_선택적설정', () => {
    process.env.MCP_AUTH_TOKEN = 'a'.repeat(32);
    process.env.META_AD_ACCOUNT_ID = 'act_123456';

    const config = loadAndValidateConfig();
    expect(config.metaAdAccountId).toBe('act_123456');
  });

  it('META_APP_SECRET_선택적hex설정', () => {
    process.env.MCP_AUTH_TOKEN = 'a'.repeat(32);
    process.env.META_APP_SECRET = 'abcdef1234567890';

    const config = loadAndValidateConfig();
    expect(config.metaAppSecret).toBe('abcdef1234567890');
  });

  it('META_APP_SECRET_비hex문자_에러발생', () => {
    process.env.MCP_AUTH_TOKEN = 'a'.repeat(32);
    process.env.META_APP_SECRET = 'not-a-hex-string!';

    expect(() => loadAndValidateConfig()).toThrow('hex');
  });

  it('짧은MCP_AUTH_TOKEN_경고출력', () => {
    process.env.MCP_AUTH_TOKEN = 'short';

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = loadAndValidateConfig();
    expect(config.mcpAuthToken).toBe('short');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('shorter than 32'),
    );
    warnSpy.mockRestore();
  });
});
