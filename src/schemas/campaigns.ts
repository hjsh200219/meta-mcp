import { z } from 'zod';
import { PaginationSchema, StatusFilterSchema } from './common.js';

export const ListCampaignsSchema = {
  ad_account_id: z.string().describe('Ad account ID (e.g. act_123)'),
  status_filter: StatusFilterSchema,
  ...PaginationSchema,
};

export const GetCampaignSchema = {
  campaign_id: z.string().describe('Campaign ID'),
};

const CampaignObjectiveEnum = z.enum([
  'OUTCOME_AWARENESS',
  'OUTCOME_ENGAGEMENT',
  'OUTCOME_LEADS',
  'OUTCOME_SALES',
  'OUTCOME_TRAFFIC',
  'OUTCOME_APP_PROMOTION',
]);

export const CreateCampaignSchema = {
  ad_account_id: z.string().describe('Ad account ID'),
  name: z.string().describe('Campaign name'),
  objective: CampaignObjectiveEnum.describe('Campaign objective'),
  status: z.enum(['ACTIVE', 'PAUSED']).describe('Campaign status'),
  special_ad_categories: z.array(z.string()).optional().describe('Special ad categories'),
  daily_budget: z.string().optional().describe('Daily budget in cents'),
  lifetime_budget: z.string().optional().describe('Lifetime budget in cents'),
};

export const UpdateCampaignSchema = {
  campaign_id: z.string().describe('Campaign ID'),
  name: z.string().optional().describe('Campaign name'),
  status: z.enum(['ACTIVE', 'PAUSED']).optional().describe('Campaign status'),
  daily_budget: z.string().optional().describe('Daily budget in cents'),
  lifetime_budget: z.string().optional().describe('Lifetime budget in cents'),
};

export const DeleteCampaignSchema = {
  campaign_id: z.string().describe('Campaign ID'),
};
