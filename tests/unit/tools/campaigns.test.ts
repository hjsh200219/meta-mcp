import { describe, it, expect, beforeEach, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCampaignTools } from '../../../src/tools/campaigns.js';
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

describe('registerCampaignTools', () => {
  let server: McpServer;
  let cache: TtlCache;

  beforeEach(() => {
    vi.clearAllMocks();
    server = new McpServer({ name: 'test', version: '1.0.0' });
    cache = new TtlCache();
    registerCampaignTools(server, mockClient, cache, mockLogger);
  });

  it('list_campaigns_캐시미스_API호출후캐시저장', async () => {
    const mockResult = { data: [{ id: '1', name: 'Campaign' }], pagination: { next_cursor: null, has_next: false } };
    vi.mocked(mockClient.get).mockResolvedValue({ data: mockResult.data, paging: {} });

    const tools = (server as unknown as { _registeredTools: Record<string, { handler: (args: unknown) => Promise<unknown> }> })._registeredTools;
    const listCampaigns = tools.list_campaigns?.handler;
    expect(listCampaigns).toBeDefined();
    if (!listCampaigns) return;

    const result = await listCampaigns({
      ad_account_id: 'act_123',
    });

    expect(mockClient.get).toHaveBeenCalled();
    expect(result).toMatchObject({ content: [{ type: 'text', text: expect.any(String) }] });
    const text = (result as { content: Array<{ text: string }> }).content[0].text;
    expect(JSON.parse(text)).toMatchObject({ data: expect.any(Array) });

    const cached = cache.get<string>(`list_campaigns:${JSON.stringify({ ad_account_id: 'act_123' })}`);
    expect(cached).toBeDefined();
  });

  it('list_campaigns_캐시히트_API미호출', async () => {
    const cacheKey = 'list_campaigns:{"ad_account_id":"act_123"}';
    cache.set(cacheKey, JSON.stringify({ data: [], pagination: { next_cursor: null, has_next: false } }), 60_000);

    const tools = (server as unknown as { _registeredTools: Record<string, { handler: (args: unknown) => Promise<unknown> }> })._registeredTools;
    const handler = tools.list_campaigns?.handler;
    expect(handler).toBeDefined();
    const result = handler ? await handler({ ad_account_id: 'act_123' }) : null;

    expect(mockClient.get).not.toHaveBeenCalled();
    expect(result).toMatchObject({ content: [{ type: 'text' }] });
  });

  it('create_campaign_쓰기작업_로거호출_캐시무효화', async () => {
    vi.mocked(mockClient.get).mockResolvedValue({ id: 'new_1', name: 'New', objective: 'OUTCOME_TRAFFIC', status: 'ACTIVE' });
    vi.mocked(mockClient.post).mockResolvedValue({ id: 'new_1' });

    const tools = (server as unknown as { _registeredTools: Record<string, { handler: (args: unknown) => Promise<unknown> }> })._registeredTools;
    cache.set('list_campaigns:foo', 'cached', 60_000);

    const createHandler = tools.create_campaign?.handler;
    expect(createHandler).toBeDefined();
    if (createHandler) {
      await createHandler({
        ad_account_id: 'act_123',
        name: 'New Campaign',
        objective: 'OUTCOME_TRAFFIC',
        status: 'ACTIVE',
      });
    }

    expect(mockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ tool: 'create_campaign' }), 'Write op');
    expect(cache.get('list_campaigns:foo')).toBeUndefined();
  });

  it('list_campaigns_에러발생_throw', async () => {
    vi.mocked(mockClient.get).mockRejectedValue(new Error('API error'));

    const tools = (server as unknown as { _registeredTools: Record<string, { handler: (args: unknown) => Promise<unknown> }> })._registeredTools;
    const handler = tools.list_campaigns?.handler;
    expect(handler).toBeDefined();
    if (handler) await expect(handler({ ad_account_id: 'act_123' })).rejects.toThrow();
  });
});
