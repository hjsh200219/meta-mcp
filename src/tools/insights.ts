import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MetaApiClient } from '../meta-api/types.js';
import type { TtlCache } from '../lib/cache.js';
import type { Logger } from '../lib/logger.js';
import * as insightApi from '../meta-api/insights.js';
import {
  GetCampaignInsightsSchema,
  GetAdSetInsightsSchema,
  GetAdInsightsSchema,
} from '../schemas/insights.js';

export function registerInsightTools(
  server: McpServer,
  client: MetaApiClient,
  cache: TtlCache,
  _logger: Logger
): void {
  const register = (
    name: string,
    desc: string,
    schema: object,
    fetcher: (client: MetaApiClient, id: string, params?: { date_preset?: string; time_range?: { since: string; until: string }; fields?: string[] }) => Promise<unknown[]>
  ) => {
    server.tool(name, desc, schema, async (params) => {
      const id = 'campaign_id' in params ? params.campaign_id : 'ad_set_id' in params ? params.ad_set_id : params.ad_id;
      const cacheKey = `${name}:${id}:${JSON.stringify({ date_preset: params.date_preset, time_range: params.time_range, fields: params.fields })}`;
      const cached = cache.get<string>(cacheKey);
      if (cached) return { content: [{ type: 'text' as const, text: cached }] };

      const data = await fetcher(client, id, {
        date_preset: params.date_preset,
        time_range: params.time_range,
        fields: params.fields,
      });
      const result = { data };
      const text = JSON.stringify(result);
      cache.set(cacheKey, text, 300_000);
      return { content: [{ type: 'text' as const, text }] };
    });
  };

  register('get_campaign_insights', 'Get campaign performance', GetCampaignInsightsSchema, insightApi.getCampaignInsights);
  register('get_ad_set_insights', 'Get ad set performance', GetAdSetInsightsSchema, insightApi.getAdSetInsights);
  register('get_ad_insights', 'Get ad performance', GetAdInsightsSchema, insightApi.getAdInsights);
}
