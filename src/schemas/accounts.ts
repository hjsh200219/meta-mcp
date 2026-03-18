import { z } from 'zod';

export const GetAdAccountsSchema = {
  after: z.string().optional().describe('Cursor for next page'),
};

export const GetInstagramAccountsSchema = {
  ad_account_id: z.string().describe('Ad account ID (e.g. act_123)'),
};
