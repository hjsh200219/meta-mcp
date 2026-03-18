import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  GetCampaignInsightsSchema,
  GetAdSetInsightsSchema,
  GetAdInsightsSchema,
} from '../../../src/schemas/insights.js';

describe('GetCampaignInsightsSchema', () => {
  const schema = z.object(GetCampaignInsightsSchema);

  it('valid_params_필수필드포함_검증통과', () => {
    expect(schema.parse({ campaign_id: '123' })).toEqual({ campaign_id: '123' });
  });

  it('valid_params_time_range포함_검증통과', () => {
    expect(
      schema.parse({
        campaign_id: '123',
        time_range: { since: '2024-01-01', until: '2024-01-31' },
      })
    ).toBeDefined();
  });
});

describe('GetAdSetInsightsSchema', () => {
  const schema = z.object(GetAdSetInsightsSchema);

  it('valid_params_검증통과', () => {
    expect(schema.parse({ ad_set_id: '123' })).toEqual({ ad_set_id: '123' });
  });
});

describe('GetAdInsightsSchema', () => {
  const schema = z.object(GetAdInsightsSchema);

  it('valid_params_검증통과', () => {
    expect(schema.parse({ ad_id: '123' })).toEqual({ ad_id: '123' });
  });
});
