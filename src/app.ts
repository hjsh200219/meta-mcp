import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { AppConfig } from './lib/config.js';
import { createLogger } from './lib/logger.js';
import { MetaApiClient } from './meta-api/client.js';
import { TtlCache } from './lib/cache.js';
import { createMcpServer } from './server.js';
import { createAuthMiddleware } from './middleware/auth.js';
import type { Request } from 'express';

function resolveMetaToken(req: Request, fallback?: string): string | undefined {
  return req.headers['x-meta-access-token'] as string | undefined ?? fallback;
}

export function createApp(config: AppConfig) {
  const logger = createLogger(config.logLevel);
  const cache = new TtlCache();
  const authMiddleware = createAuthMiddleware(config.mcpAuthToken);

  function buildClient(accessToken: string) {
    return new MetaApiClient(
      { accessToken, appSecret: config.metaAppSecret, apiVersion: config.metaApiVersion },
      logger,
    );
  }

  const app = express();
  app.use(express.json());

  app.post('/mcp', authMiddleware, async (req, res) => {
    const token = resolveMetaToken(req, config.metaAccessToken);
    if (!token) {
      res.status(400).json({ error: 'No Meta access token: set X-Meta-Access-Token header or META_ACCESS_TOKEN env' });
      return;
    }
    const client = buildClient(token);
    const server = createMcpServer(client, cache, logger);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => { transport.close(); });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.get('/mcp', authMiddleware, async (req, res) => {
    const token = resolveMetaToken(req, config.metaAccessToken);
    if (!token) {
      res.status(400).json({ error: 'No Meta access token: set X-Meta-Access-Token header or META_ACCESS_TOKEN env' });
      return;
    }
    const client = buildClient(token);
    const server = createMcpServer(client, cache, logger);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => { transport.close(); });
    await server.connect(transport);
    await transport.handleRequest(req, res);
  });

  app.delete('/mcp', authMiddleware, (_req, res) => {
    res.status(204).end();
  });

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), version: '1.0.0' });
  });

  return { app, logger };
}
