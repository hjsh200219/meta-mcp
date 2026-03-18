import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  ListAdSetsSchema,
  CreateAdSetSchema,
  GetAdSetSchema,
  UpdateAdSetSchema,
  DeleteAdSetSchema,
} from '../../../src/schemas/adSets.js';

describe('ListAdSetsSchema', () => {
  const schema = z.object(ListAdSetsSchema);

  it('valid_params_필수필드포함_검증통과', () => {
    expect(schema.parse({ campaign_id: '123' })).toEqual({ campaign_id: '123' });
  });

  it('invalid_params_campaign_id누락_검증실패', () => {
    expect(() => schema.parse({})).toThrow();
  });
});

describe('CreateAdSetSchema', () => {
  const schema = z.object(CreateAdSetSchema);

  it('valid_params_필수필드포함_검증통과', () => {
    expect(
      schema.parse({
        ad_account_id: 'act_123',
        campaign_id: '123',
        name: 'Test',
        optimization_goal: 'LINK_CLICKS',
        billing_event: 'IMPRESSIONS',
        targeting: {},
      })
    ).toBeDefined();
  });

  it('invalid_params_optimization_goal잘못된enum_검증실패', () => {
    expect(() =>
      schema.parse({
        ad_account_id: 'act_123',
        campaign_id: '123',
        name: 'Test',
        optimization_goal: 'INVALID',
        billing_event: 'IMPRESSIONS',
        targeting: {},
      })
    ).toThrow();
  });
});

describe('GetAdSetSchema', () => {
  const schema = z.object(GetAdSetSchema);

  it('valid_params_검증통과', () => {
    expect(schema.parse({ ad_set_id: '123' })).toEqual({ ad_set_id: '123' });
  });
});

describe('UpdateAdSetSchema', () => {
  const schema = z.object(UpdateAdSetSchema);

  it('valid_params_검증통과', () => {
    expect(schema.parse({ ad_set_id: '123' })).toEqual({ ad_set_id: '123' });
  });
});

describe('DeleteAdSetSchema', () => {
  const schema = z.object(DeleteAdSetSchema);

  it('valid_params_검증통과', () => {
    expect(schema.parse({ ad_set_id: '123' })).toEqual({ ad_set_id: '123' });
  });
});
