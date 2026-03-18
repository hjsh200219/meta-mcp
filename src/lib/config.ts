import { ConfigurationError } from './errors.js';

export interface AppConfig {
  metaAccessToken: string;
  mcpAuthToken: string;
  metaAdAccountId?: string;
  metaAppSecret?: string;
  metaApiVersion: string;
  port: number;
  logLevel: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new ConfigurationError(`Required environment variable ${name} is missing or empty`);
  }
  return value;
}

export function loadAndValidateConfig(): AppConfig {
  const metaAccessToken = requireEnv('META_ACCESS_TOKEN');
  const mcpAuthToken = requireEnv('MCP_AUTH_TOKEN');

  return {
    metaAccessToken,
    mcpAuthToken,
    metaAdAccountId: process.env.META_AD_ACCOUNT_ID || undefined,
    metaAppSecret: process.env.META_APP_SECRET || undefined,
    metaApiVersion: process.env.META_API_VERSION || 'v25.0',
    port: Number(process.env.PORT) || 3000,
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}
