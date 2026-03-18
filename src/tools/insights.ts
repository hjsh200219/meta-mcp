import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MetaApiClient } from '../meta-api/types.js';
import type { TtlCache } from '../lib/cache.js';
import type { Logger } from '../lib/logger.js';
import * as insightApi from '../meta-api/insights.js';
import { withErrorHandling } from './utils.js';
import {
  GetCampaignInsightsSchema,
  GetAdSetInsightsSchema,
  GetAdInsightsSchema,
} from '../schemas/insights.js';

type InsightFetcher = (
  client: MetaApiClient,
  id: string,
  params?: { date_preset?: string; time_range?: { since: string; until: string }; fields?: string[] },
) => Promise<unknown[]>;

function registerInsightTool(
  server: McpServer,
  client: MetaApiClient,
  cache: TtlCache,
  logger: Logger,
  name: string,
  desc: string,
  schema: object,
  fetcher: InsightFetcher,
) {
  server.tool(name, desc, schema,
    withErrorHandling(name, logger, async (params) => {
      const id = 'campaign_id' in params
        ? (params as { campaign_id: string }).campaign_id
        : 'ad_set_id' in params
          ? (params as { ad_set_id: string }).ad_set_id
          : (params as { ad_id: string }).ad_id;
      const insightParams = params as { date_preset?: string; time_range?: { since: string; until: string }; fields?: string[] };
      const cacheKey = `${name}:${id}:${JSON.stringify(insightParams)}`;
      const cached = cache.get<string>(cacheKey);
      if (cached) return { content: [{ type: 'text' as const, text: cached }] };

      const data = await fetcher(client, id, {
        date_preset: insightParams.date_preset,
        time_range: insightParams.time_range,
        fields: insightParams.fields,
      });
      const text = JSON.stringify({ data });
      cache.set(cacheKey, text, 300_000);
      return { content: [{ type: 'text' as const, text }] };
    }),
  );
}

export function registerInsightTools(
  server: McpServer,
  client: MetaApiClient,
  cache: TtlCache,
  logger: Logger,
): void {
  registerInsightTool(server, client, cache, logger, 'get_campaign_insights', 'Get campaign performance', GetCampaignInsightsSchema, insightApi.getCampaignInsights);
  registerInsightTool(server, client, cache, logger, 'get_ad_set_insights', 'Get ad set performance', GetAdSetInsightsSchema, insightApi.getAdSetInsights);
  registerInsightTool(server, client, cache, logger, 'get_ad_insights', 'Get ad performance', GetAdInsightsSchema, insightApi.getAdInsights);
}
