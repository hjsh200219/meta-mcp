import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MetaApiClient } from './meta-api/types.js';
import type { TtlCache } from './lib/cache.js';
import type { Logger } from './lib/logger.js';
import { registerCampaignTools } from './tools/campaigns.js';
import { registerAdSetTools } from './tools/adSets.js';
import { registerAdTools } from './tools/ads.js';
import { registerCreativeTools } from './tools/creatives.js';
import { registerInsightTools } from './tools/insights.js';
import { registerAccountTools } from './tools/accounts.js';

export function createMcpServer(
  client: MetaApiClient,
  cache: TtlCache,
  logger: Logger
): McpServer {
  const server = new McpServer({ name: 'instagram-ads-mcp', version: '1.0.0' });
  registerCampaignTools(server, client, cache, logger);
  registerAdSetTools(server, client, cache, logger);
  registerAdTools(server, client, cache, logger);
  registerCreativeTools(server, client, cache, logger);
  registerInsightTools(server, client, cache, logger);
  registerAccountTools(server, client, cache, logger);
  return server;
}
