import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { MetaApiClient } from './meta-api/client.js';
import { TtlCache } from './lib/cache.js';
import { createLogger } from './lib/logger.js';
import { createMcpServer } from './server.js';
import { ConfigurationError } from './lib/errors.js';

const metaAccessToken = process.env.META_ACCESS_TOKEN;
if (!metaAccessToken) {
  throw new ConfigurationError('META_ACCESS_TOKEN is required');
}

const apiVersion = process.env.META_API_VERSION || 'v25.0';
const logLevel = process.env.LOG_LEVEL || 'warn';
const logger = createLogger(logLevel);

const client = new MetaApiClient(
  { accessToken: metaAccessToken, appSecret: process.env.META_APP_SECRET, apiVersion },
  logger,
);
const cache = new TtlCache();
const server = createMcpServer(client, cache, logger);

const transport = new StdioServerTransport();
await server.connect(transport);
