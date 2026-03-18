import { z } from 'zod';

const TimeRangeSchema = z.object({
  since: z.string().describe('Start date (YYYY-MM-DD)'),
  until: z.string().describe('End date (YYYY-MM-DD)'),
});

export const GetCampaignInsightsSchema = {
  campaign_id: z.string().describe('Campaign ID'),
  date_preset: z.string().optional().describe('Date preset (e.g. last_7d, last_30d)'),
  time_range: TimeRangeSchema.optional().describe('Custom time range'),
  fields: z.array(z.string()).optional().describe('Insight fields to return'),
};

export const GetAdSetInsightsSchema = {
  ad_set_id: z.string().describe('Ad set ID'),
  date_preset: z.string().optional().describe('Date preset (e.g. last_7d, last_30d)'),
  time_range: TimeRangeSchema.optional().describe('Custom time range'),
  fields: z.array(z.string()).optional().describe('Insight fields to return'),
};

export const GetAdInsightsSchema = {
  ad_id: z.string().describe('Ad ID'),
  date_preset: z.string().optional().describe('Date preset (e.g. last_7d, last_30d)'),
  time_range: TimeRangeSchema.optional().describe('Custom time range'),
  fields: z.array(z.string()).optional().describe('Insight fields to return'),
};
