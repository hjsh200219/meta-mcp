import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { PaginationSchema, StatusFilterSchema } from '../../../src/schemas/common.js';

describe('PaginationSchema', () => {
  const schema = z.object(PaginationSchema);

  it('valid_params_유효한limit와after_검증통과', () => {
    expect(schema.parse({ limit: 25, after: 'cursor123' })).toEqual({
      limit: 25,
      after: 'cursor123',
    });
  });

  it('valid_params_limit만_검증통과', () => {
    expect(schema.parse({ limit: 50 })).toEqual({ limit: 50 });
  });

  it('valid_params_빈객체_검증통과', () => {
    expect(schema.parse({})).toEqual({});
  });

  it('invalid_params_limit범위초과_검증실패', () => {
    expect(() => schema.parse({ limit: 101 })).toThrow();
  });

  it('invalid_params_limit범위미만_검증실패', () => {
    expect(() => schema.parse({ limit: 0 })).toThrow();
  });
});

describe('StatusFilterSchema', () => {
  it('valid_ACTIVE_검증통과', () => {
    expect(StatusFilterSchema.parse('ACTIVE')).toBe('ACTIVE');
  });

  it('valid_undefined_검증통과', () => {
    expect(StatusFilterSchema.parse(undefined)).toBeUndefined();
  });

  it('invalid_잘못된enum_검증실패', () => {
    expect(() => StatusFilterSchema.parse('INVALID')).toThrow();
  });
});
