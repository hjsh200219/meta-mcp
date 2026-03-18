import type { MetaApiClient } from './types.js';
import type { AdAccount, InstagramAccount, PaginatedResponse } from './types.js';

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

export async function getAdAccounts(
  client: MetaApiClient,
  params?: { after?: string }
): Promise<PaginatedResponse<AdAccount>> {
  const query: Record<string, string> = {
    fields: 'id,name,account_id,account_status,currency',
  };
  if (params?.after) query.after = params.after;

  const res = await client.get<{ data: AdAccount[]; paging?: { cursors?: { after?: string }; next?: string } }>(
    '/me/adaccounts',
    query
  );
  return parsePaginatedResponse(res);
}

export async function getInstagramAccounts(
  client: MetaApiClient,
  adAccountId: string
): Promise<InstagramAccount[]> {
  const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  const res = await client.get<{ data: InstagramAccount[] }>(
    `/${accountId}/instagram_accounts`,
    { fields: 'id,username,name,profile_pic' }
  );
  return res.data ?? [];
}
