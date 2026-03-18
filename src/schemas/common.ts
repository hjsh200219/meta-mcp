import { z } from 'zod';

export const PaginationSchema = {
  limit: z.number().min(1).max(100).optional().describe('Items per page (1-100, default 25)'),
  after: z.string().optional().describe('Cursor for next page'),
};

export const StatusFilterSchema = z
  .enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'])
  .optional()
  .describe('Filter by status');
