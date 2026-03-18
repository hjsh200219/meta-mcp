import type { MetaApiClient } from './types.js';
import type {
  AdSet,
  CreateAdSetParams,
  ListParams,
  PaginatedResponse,
  UpdateAdSetParams,
} from './types.js';

function parsePaginatedResponse<T>(raw: {
  data: T[];
  paging?: { cursors?: { after?: string }; next?: string };
}): PaginatedResponse<T> {
  return {
    data: raw.data,
    pagination: {
      next_cursor: raw.paging?.cursors?.after ?? null,
      has_next: !!raw.paging?.next,
    },
  };
}

export async function listAdSets(
  client: MetaApiClient,
  campaignId: string,
  params?: ListParams
): Promise<PaginatedResponse<AdSet>> {
  const query: Record<string, string> = {
    fields: 'id,name,campaign_id,optimization_goal,billing_event,bid_amount,daily_budget,lifetime_budget,targeting,status,start_time,end_time',
  };
  if (params?.status_filter) query.filtering = JSON.stringify([{ field: 'effective_status', operator: 'IN', value: [params.status_filter] }]);
  if (params?.limit) query.limit = String(params.limit);
  if (params?.after) query.after = params.after;

  const res = await client.get<{ data: AdSet[]; paging?: { cursors?: { after?: string }; next?: string } }>(
    `/${campaignId}/adsets`,
    query
  );
  return parsePaginatedResponse(res);
}

export async function getAdSet(client: MetaApiClient, adSetId: string): Promise<AdSet> {
  const res = await client.get<AdSet>(`/${adSetId}`, {
    fields: 'id,name,campaign_id,optimization_goal,billing_event,bid_amount,daily_budget,lifetime_budget,targeting,status,start_time,end_time',
  });
  return res;
}

export async function createAdSet(
  client: MetaApiClient,
  adAccountId: string,
  params: CreateAdSetParams
): Promise<{ id: string }> {
  const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  const body: Record<string, unknown> = {
    name: params.name,
    campaign_id: params.campaign_id,
    optimization_goal: params.optimization_goal,
    billing_event: params.billing_event,
    targeting: params.targeting,
  };
  if (params.bid_amount) body.bid_amount = params.bid_amount;
  if (params.daily_budget) body.daily_budget = params.daily_budget;
  if (params.lifetime_budget) body.lifetime_budget = params.lifetime_budget;
  if (params.instagram_positions?.length) body.instagram_positions = params.instagram_positions;
  if (params.start_time) body.start_time = params.start_time;
  if (params.end_time) body.end_time = params.end_time;
  if (params.status) body.status = params.status;

  const res = await client.post<{ id: string }>(`/${accountId}/adsets`, body);
  return { id: res.id };
}

export async function updateAdSet(
  client: MetaApiClient,
  adSetId: string,
  params: UpdateAdSetParams
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (params.name !== undefined) body.name = params.name;
  if (params.status !== undefined) body.status = params.status;
  if (params.daily_budget !== undefined) body.daily_budget = params.daily_budget;
  if (params.bid_amount !== undefined) body.bid_amount = params.bid_amount;
  if (params.targeting !== undefined) body.targeting = params.targeting;
  if (Object.keys(body).length === 0) return;
  await client.post(`/${adSetId}`, body);
}

export async function deleteAdSet(client: MetaApiClient, adSetId: string): Promise<void> {
  await client.delete(`/${adSetId}`);
}
