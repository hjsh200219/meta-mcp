import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  ListCampaignsSchema,
  CreateCampaignSchema,
  UpdateCampaignSchema,
  GetCampaignSchema,
  DeleteCampaignSchema,
} from '../../../src/schemas/campaigns.js';

describe('ListCampaignsSchema', () => {
  const schema = z.object(ListCampaignsSchema);

  it('valid_params_필수필드포함_검증통과', () => {
    expect(schema.parse({ ad_account_id: 'act_123' })).toEqual({
      ad_account_id: 'act_123',
    });
  });

  it('valid_params_전체필드_검증통과', () => {
    expect(
      schema.parse({
        ad_account_id: 'act_123',
        status_filter: 'ACTIVE',
        limit: 50,
        after: 'cursor',
      })
    ).toEqual({
      ad_account_id: 'act_123',
      status_filter: 'ACTIVE',
      limit: 50,
      after: 'cursor',
    });
  });

  it('invalid_params_ad_account_id누락_검증실패', () => {
    expect(() => schema.parse({})).toThrow();
  });
});

describe('CreateCampaignSchema', () => {
  const schema = z.object(CreateCampaignSchema);

  it('valid_params_필수필드포함_검증통과', () => {
    expect(
      schema.parse({
        ad_account_id: 'act_123',
        name: 'Test',
        objective: 'OUTCOME_TRAFFIC',
        status: 'ACTIVE',
      })
    ).toBeDefined();
  });

  it('invalid_params_objective잘못된enum_검증실패', () => {
    expect(() =>
      schema.parse({
        ad_account_id: 'act_123',
        name: 'Test',
        objective: 'INVALID',
        status: 'ACTIVE',
      })
    ).toThrow();
  });

  it('invalid_params_status잘못된enum_검증실패', () => {
    expect(() =>
      schema.parse({
        ad_account_id: 'act_123',
        name: 'Test',
        objective: 'OUTCOME_TRAFFIC',
        status: 'DELETED',
      })
    ).toThrow();
  });
});

describe('UpdateCampaignSchema', () => {
  const schema = z.object(UpdateCampaignSchema);

  it('valid_params_campaign_id만_검증통과', () => {
    expect(schema.parse({ campaign_id: '123' })).toEqual({ campaign_id: '123' });
  });

  it('invalid_params_campaign_id누락_검증실패', () => {
    expect(() => schema.parse({})).toThrow();
  });
});

describe('GetCampaignSchema', () => {
  const schema = z.object(GetCampaignSchema);

  it('valid_params_검증통과', () => {
    expect(schema.parse({ campaign_id: '123' })).toEqual({ campaign_id: '123' });
  });
});

describe('DeleteCampaignSchema', () => {
  const schema = z.object(DeleteCampaignSchema);

  it('valid_params_검증통과', () => {
    expect(schema.parse({ campaign_id: '123' })).toEqual({ campaign_id: '123' });
  });
});
