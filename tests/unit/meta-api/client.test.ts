import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MetaApiClient } from '../../../src/meta-api/client.js';
import { MetaApiError, RateLimitError } from '../../../src/lib/errors.js';
import type { MetaApiConfig } from '../../../src/meta-api/types.js';
import type { Logger } from '../../../src/lib/logger.js';

const mockLogger: Logger = {
  child: vi.fn().mockReturnThis(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  fatal: vi.fn(),
  silent: vi.fn(),
} as unknown as Logger;

const baseConfig: MetaApiConfig = {
  accessToken: 'test-token',
  apiVersion: 'v25.0',
};

function mockResponse(
  ok: boolean,
  data: unknown,
  headers?: Headers,
  status?: number,
): Response {
  const body = JSON.stringify(data);
  return {
    ok,
    status: status ?? (ok ? 200 : 400),
    statusText: ok ? 'OK' : 'Bad Request',
    text: async () => body,
    headers: headers ?? new Headers(),
  } as Response;
}

function meOk(): Response {
  return mockResponse(true, { id: 'me', name: 'Test User' });
}

describe('MetaApiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('get_정상응답_데이터반환', async () => {
    const mockData = { id: '123', name: 'Campaign' };
    vi.mocked(fetch)
      .mockResolvedValueOnce(meOk())
      .mockResolvedValueOnce(mockResponse(true, mockData));

    const client = new MetaApiClient(baseConfig, mockLogger);
    const result = await client.get<typeof mockData>('/act_123/campaigns');

    expect(result).toEqual(mockData);
  });

  it('post_정상응답_데이터반환', async () => {
    const mockData = { id: '456' };
    vi.mocked(fetch)
      .mockResolvedValueOnce(meOk())
      .mockResolvedValueOnce(mockResponse(true, mockData));

    const client = new MetaApiClient(baseConfig, mockLogger);
    const result = await client.post<typeof mockData>('/act_123/campaigns', {
      name: 'Test',
    });

    expect(result).toEqual(mockData);
  });

  it('delete_정상응답_void반환', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(meOk())
      .mockResolvedValueOnce(mockResponse(true, { success: true }));

    const client = new MetaApiClient(baseConfig, mockLogger);
    await client.delete('/12345');

    const calls = vi.mocked(fetch).mock.calls;
    expect(calls[1][0]).toContain('/12345');
  });

  it('get_MetaAPI에러응답_MetaApiError발생', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(false, {
        error: {
          message: 'Invalid OAuth access token',
          type: 'OAuthException',
          code: 190,
          fbtrace_id: 'trace123',
        },
      }),
    );

    const client = new MetaApiClient(baseConfig, mockLogger);

    let err: unknown;
    try {
      await client.get('/me');
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(MetaApiError);
    expect(err).toMatchObject({
      message: 'Invalid OAuth access token',
      code: 190,
      fbtraceId: 'trace123',
    });
  });

  it('get_429응답_재시도후성공', async () => {
    const mockData = { id: 'ok' };
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        mockResponse(false, {}, new Headers({ 'Retry-After': '1' }), 429),
      )
      .mockResolvedValueOnce(mockResponse(true, mockData));

    const client = new MetaApiClient(baseConfig, mockLogger);
    const result = await client.get<typeof mockData>('/me');

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockData);
  });

  it('get_429응답3회실패_RateLimitError발생', async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse(false, {}, new Headers({ 'Retry-After': '1' }), 429),
    );

    const client = new MetaApiClient(baseConfig, mockLogger);

    await expect(client.get('/me')).rejects.toThrow(RateLimitError);
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('appsecret_proof_appSecret존재시_요청에포함', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(true, { id: 'me' }));

    const client = new MetaApiClient(
      { ...baseConfig, appSecret: 'abcdef1234567890' },
      mockLogger,
    );
    await client.get('/me');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/appsecret_proof=/),
      expect.any(Object),
    );
  });

  it('validateToken_me호출_tokenValidated설정', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(true, { id: '123', name: 'Test User' }),
    );

    const client = new MetaApiClient(baseConfig, mockLogger);
    await client.validateToken();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/me'),
      expect.any(Object),
    );
    expect(client.tokenValidated).toBe(true);
  });

  it('checkConnection_정상_true반환', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(true, { id: 'me' }));

    const client = new MetaApiClient(baseConfig, mockLogger);
    const result = await client.checkConnection();

    expect(result).toBe(true);
  });

  it('checkConnection_에러_false반환', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(false, {
        error: { message: 'Invalid token', type: 'OAuthException', code: 190 },
      }),
    );

    const client = new MetaApiClient(baseConfig, mockLogger);
    const result = await client.checkConnection();

    expect(result).toBe(false);
  });

  it('post_429응답_RateLimitError발생', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(meOk())
      .mockResolvedValueOnce(
        mockResponse(false, {}, new Headers({ 'Retry-After': '30' }), 429),
      );

    const client = new MetaApiClient(baseConfig, mockLogger);
    await expect(client.post('/act_123/campaigns', {})).rejects.toThrow(RateLimitError);
  });

  it('delete_429응답_재시도후성공', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(meOk())
      .mockResolvedValueOnce(
        mockResponse(false, {}, new Headers({ 'Retry-After': '1' }), 429),
      )
      .mockResolvedValueOnce(mockResponse(true, { success: true }));

    const client = new MetaApiClient(baseConfig, mockLogger);
    await client.delete('/12345');

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('ensureTokenValidated_한번만호출', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(meOk())
      .mockResolvedValueOnce(mockResponse(true, { data: [] }))
      .mockResolvedValueOnce(mockResponse(true, { data: [] }));

    const client = new MetaApiClient(baseConfig, mockLogger);
    await client.get('/act_123/campaigns');
    await client.get('/act_123/adsets');

    const calls = vi.mocked(fetch).mock.calls;
    const meCalls = calls.filter(([url]) => String(url).includes('/me'));
    expect(meCalls).toHaveLength(1);
  });
});
