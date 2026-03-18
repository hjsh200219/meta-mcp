import { describe, it, expect, beforeEach, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAccountTools } from '../../../src/tools/accounts.js';
import type { MetaApiClient } from '../../../src/meta-api/types.js';
import { TtlCache } from '../../../src/lib/cache.js';
import type { Logger } from '../../../src/lib/logger.js';

const mockClient: MetaApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
};

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

describe('registerAccountTools', () => {
  let server: McpServer;
  let cache: TtlCache;

  beforeEach(() => {
    vi.clearAllMocks();
    server = new McpServer({ name: 'test', version: '1.0.0' });
    cache = new TtlCache();
    registerAccountTools(server, mockClient, cache, mockLogger);
  });

  it('get_ad_accounts_캐시미스_API호출', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({
      data: [{ id: 'act_1', name: 'Account', account_id: '1', account_status: 1, currency: 'USD' }],
      paging: {},
    });

    const tools = (server as unknown as { _registeredTools: Record<string, { handler: (args: unknown) => Promise<unknown> }> })._registeredTools;
    const handler = tools.get_ad_accounts?.handler;
    expect(handler).toBeDefined();
    const result = handler ? await handler({}) : null;

    expect(mockClient.get).toHaveBeenCalled();
    expect(result).toMatchObject({ content: [{ type: 'text' }] });
  });

  it('get_instagram_accounts_캐시저장', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ data: [{ id: 'ig_1', username: 'test' }] });

    const tools = (server as unknown as { _registeredTools: Record<string, { handler: (args: unknown) => Promise<unknown> }> })._registeredTools;
    const handler = tools.get_instagram_accounts?.handler;
    expect(handler).toBeDefined();
    if (handler) await handler({ ad_account_id: 'act_123' });

    expect(cache.get('get_instagram_accounts:act_123')).toBeDefined();
  });
});
