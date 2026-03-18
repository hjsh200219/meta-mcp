import { z } from 'zod';
import { PaginationSchema, StatusFilterSchema } from './common.js';

export const ListAdSetsSchema = {
  campaign_id: z.string().describe('Campaign ID'),
  status_filter: StatusFilterSchema,
  ...PaginationSchema,
};

export const GetAdSetSchema = {
  ad_set_id: z.string().describe('Ad set ID'),
};

const OptimizationGoalEnum = z.enum([
  'LINK_CLICKS',
  'IMPRESSIONS',
  'REACH',
  'OUTCOME_LEADS',
  'OUTCOME_SALES',
  'OUTCOME_TRAFFIC',
  'OUTCOME_ENGAGEMENT',
  'OUTCOME_AWARENESS',
  'OUTCOME_APP_PROMOTION',
]);

const BillingEventEnum = z.enum([
  'IMPRESSIONS',
  'LINK_CLICKS',
  'POST_ENGAGEMENT',
  'PAGE_ENGAGEMENT',
  'APP_INSTALLS',
  'VIDEO_VIEWS',
  'THRUPLAY',
  'PURCHASE',
]);

export const CreateAdSetSchema = {
  ad_account_id: z.string().describe('Ad account ID (e.g. act_123)'),
  campaign_id: z.string().describe('Campaign ID'),
  name: z.string().describe('Ad set name'),
  optimization_goal: OptimizationGoalEnum.describe('Optimization goal'),
  billing_event: BillingEventEnum.describe('Billing event'),
  bid_amount: z.string().optional().describe('Bid amount in cents'),
  daily_budget: z.string().optional().describe('Daily budget in cents'),
  lifetime_budget: z.string().optional().describe('Lifetime budget in cents'),
  targeting: z.record(z.string(), z.unknown()).describe('Targeting spec (JSON object)'),
  instagram_positions: z.array(z.string()).optional().describe('Instagram ad positions'),
  start_time: z.string().optional().describe('Start time (ISO 8601)'),
  end_time: z.string().optional().describe('End time (ISO 8601)'),
  status: z.enum(['ACTIVE', 'PAUSED']).optional().describe('Ad set status'),
};

export const UpdateAdSetSchema = {
  ad_set_id: z.string().describe('Ad set ID'),
  name: z.string().optional().describe('Ad set name'),
  status: z.enum(['ACTIVE', 'PAUSED']).optional().describe('Ad set status'),
  daily_budget: z.string().optional().describe('Daily budget in cents'),
  bid_amount: z.string().optional().describe('Bid amount in cents'),
  targeting: z.record(z.string(), z.unknown()).optional().describe('Targeting spec (JSON object)'),
};

export const DeleteAdSetSchema = {
  ad_set_id: z.string().describe('Ad set ID'),
};
