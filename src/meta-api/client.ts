import { createHmac } from 'node:crypto';
import { MetaApiError, RateLimitError } from '../lib/errors.js';
import type { Logger } from '../lib/logger.js';
import type { MetaApiConfig, MetaErrorResponse } from './types.js';

const MAX_RETRIES = 3;

function computeAppSecretProof(accessToken: string, appSecret: string): string {
  return createHmac('sha256', appSecret).update(accessToken).digest('hex');
}

function buildQueryParams(
  accessToken: string,
  appSecret: string | undefined,
  extra?: Record<string, string>,
): Record<string, string> {
  const params: Record<string, string> = { access_token: accessToken, ...extra };
  if (appSecret) {
    params.appsecret_proof = computeAppSecretProof(accessToken, appSecret);
  }
  return params;
}

function toQueryString(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

async function parseJsonOrEmpty(res: Response): Promise<unknown> {
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

async function handleMetaError(res: Response, body: unknown): Promise<never> {
  const data = body as MetaErrorResponse;
  if (data?.error) {
    throw MetaApiError.fromResponse(data);
  }
  throw new MetaApiError(`HTTP ${res.status}: ${res.statusText}`, res.status, 0, '');
}

function getRetryDelay(res: Response, attempt: number): number {
  const retryAfter = res.headers.get('Retry-After');
  if (retryAfter) {
    const sec = parseInt(retryAfter, 10);
    return Number.isNaN(sec) ? 1000 * Math.pow(2, attempt) : sec * 1000;
  }
  return 1000 * Math.pow(2, attempt);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MetaApiClient {
  readonly baseUrl: string;
  private readonly _accessToken: string;
  private readonly _appSecret: string | undefined;
  readonly logger: Logger;
  tokenValidated = false;
  private validateTokenPromise: Promise<void> | null = null;

  constructor(config: MetaApiConfig, logger: Logger) {
    this.baseUrl = `https://graph.facebook.com/${config.apiVersion}`;
    this._accessToken = config.accessToken;
    this._appSecret = config.appSecret;
    this.logger = logger;
  }

  private async ensureTokenValidated(): Promise<void> {
    if (this.tokenValidated) return;
    await this.validateToken();
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    if (path !== '/me') await this.ensureTokenValidated();

    const merged = params ? { ...params } : {};
    const qs = toQueryString(buildQueryParams(this._accessToken, this._appSecret, merged));
    const url = `${this.baseUrl}${path}?${qs}`;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const res = await fetch(url, { method: 'GET' });
      const body = await parseJsonOrEmpty(res);

      if (res.ok) return body as T;

      if (res.status === 429 && attempt < MAX_RETRIES) {
        const delay = getRetryDelay(res, attempt);
        this.logger.warn({ attempt, delay }, 'Rate limited, retrying');
        await sleep(delay);
        continue;
      }

      if (res.status === 429) {
        throw new RateLimitError('Rate limit exceeded after retries', parseRetryAfter(res));
      }

      await handleMetaError(res, body);
    }

    throw new RateLimitError('Rate limit exceeded', 60);
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    await this.ensureTokenValidated();

    const qs = toQueryString(buildQueryParams(this._accessToken, this._appSecret));
    const url = `${this.baseUrl}${path}?${qs}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await parseJsonOrEmpty(res);

    if (res.status === 429) {
      throw new RateLimitError('Rate limit exceeded', parseRetryAfter(res));
    }
    if (!res.ok) await handleMetaError(res, body);
    return body as T;
  }

  async delete(path: string): Promise<void> {
    await this.ensureTokenValidated();

    const qs = toQueryString(buildQueryParams(this._accessToken, this._appSecret));
    const url = `${this.baseUrl}${path}?${qs}`;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const res = await fetch(url, { method: 'DELETE' });
      const body = await parseJsonOrEmpty(res);

      if (res.ok) return;

      if (res.status === 429 && attempt < MAX_RETRIES) {
        const delay = getRetryDelay(res, attempt);
        this.logger.warn({ attempt, delay }, 'Rate limited on DELETE, retrying');
        await sleep(delay);
        continue;
      }

      if (res.status === 429) {
        throw new RateLimitError('Rate limit exceeded after retries', parseRetryAfter(res));
      }

      await handleMetaError(res, body);
    }
  }

  async validateToken(): Promise<void> {
    if (this.validateTokenPromise) return this.validateTokenPromise;
    this.validateTokenPromise = (async () => {
      await this.get<{ id: string }>('/me');
      this.tokenValidated = true;
    })();
    return this.validateTokenPromise;
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.get('/me');
      return true;
    } catch {
      return false;
    }
  }
}

function parseRetryAfter(res: Response): number {
  const retryAfter = res.headers.get('Retry-After');
  if (!retryAfter) return 60;
  const sec = parseInt(retryAfter, 10);
  return Number.isNaN(sec) ? 60 : sec;
}
