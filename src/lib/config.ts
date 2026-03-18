import { ConfigurationError } from './errors.js';

export interface AppConfig {
  metaAccessToken?: string;
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

function validateApiVersion(version: string): void {
  if (!/^v\d+\.\d+$/.test(version)) {
    throw new ConfigurationError(`META_API_VERSION must match v{number}.{number}, got: ${version}`);
  }
}

function validateHex(value: string, name: string): void {
  if (!/^[0-9a-fA-F]+$/.test(value)) {
    throw new ConfigurationError(`${name} must be a hex string`);
  }
}

export function loadAndValidateConfig(): AppConfig {
  const mcpAuthToken = requireEnv('MCP_AUTH_TOKEN');
  const metaAccessToken = process.env.META_ACCESS_TOKEN || undefined;

  if (mcpAuthToken.length < 32) {
    console.warn('[config] WARNING: MCP_AUTH_TOKEN is shorter than 32 characters');
  }

  const metaApiVersion = process.env.META_API_VERSION || 'v25.0';
  validateApiVersion(metaApiVersion);

  const metaAppSecret = process.env.META_APP_SECRET || undefined;
  if (metaAppSecret) {
    validateHex(metaAppSecret, 'META_APP_SECRET');
  }

  return {
    metaAccessToken,
    mcpAuthToken,
    metaAdAccountId: process.env.META_AD_ACCOUNT_ID || undefined,
    metaAppSecret,
    metaApiVersion,
    port: Number(process.env.PORT) || 3000,
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}
