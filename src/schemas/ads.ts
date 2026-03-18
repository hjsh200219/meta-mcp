import { z } from 'zod';
import { PaginationSchema, StatusFilterSchema } from './common.js';

export const ListAdsSchema = {
  ad_set_id: z.string().describe('Ad set ID'),
  status_filter: StatusFilterSchema,
  ...PaginationSchema,
};

export const GetAdSchema = {
  ad_id: z.string().describe('Ad ID'),
};

export const CreateAdSchema = {
  ad_account_id: z.string().describe('Ad account ID (e.g. act_123)'),
  ad_set_id: z.string().describe('Ad set ID'),
  name: z.string().describe('Ad name'),
  creative_id: z.string().describe('Creative ID'),
  status: z.enum(['ACTIVE', 'PAUSED']).describe('Ad status'),
};

export const UpdateAdSchema = {
  ad_id: z.string().describe('Ad ID'),
  name: z.string().optional().describe('Ad name'),
  status: z.enum(['ACTIVE', 'PAUSED']).optional().describe('Ad status'),
  creative_id: z.string().optional().describe('Creative ID'),
};

export const DeleteAdSchema = {
  ad_id: z.string().describe('Ad ID'),
};
