import type { MetaApiClient } from './types.js';
import type { InsightData, InsightParams } from './types.js';

export async function getCampaignInsights(
  client: MetaApiClient,
  campaignId: string,
  params?: InsightParams
): Promise<InsightData[]> {
  const query: Record<string, string> = {};
  if (params?.date_preset) query.date_preset = params.date_preset;
  if (params?.time_range) query.time_range = JSON.stringify(params.time_range);
  if (params?.fields?.length) query.fields = params.fields.join(',');

  const res = await client.get<{ data: InsightData[] }>(`/${campaignId}/insights`, query);
  return res.data ?? [];
}

export async function getAdSetInsights(
  client: MetaApiClient,
  adSetId: string,
  params?: InsightParams
): Promise<InsightData[]> {
  const query: Record<string, string> = {};
  if (params?.date_preset) query.date_preset = params.date_preset;
  if (params?.time_range) query.time_range = JSON.stringify(params.time_range);
  if (params?.fields?.length) query.fields = params.fields.join(',');

  const res = await client.get<{ data: InsightData[] }>(`/${adSetId}/insights`, query);
  return res.data ?? [];
}

export async function getAdInsights(
  client: MetaApiClient,
  adId: string,
  params?: InsightParams
): Promise<InsightData[]> {
  const query: Record<string, string> = {};
  if (params?.date_preset) query.date_preset = params.date_preset;
  if (params?.time_range) query.time_range = JSON.stringify(params.time_range);
  if (params?.fields?.length) query.fields = params.fields.join(',');

  const res = await client.get<{ data: InsightData[] }>(`/${adId}/insights`, query);
  return res.data ?? [];
}
