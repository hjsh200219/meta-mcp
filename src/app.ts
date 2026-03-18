import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { AppConfig } from './lib/config.js';
import { createLogger } from './lib/logger.js';
import { MetaApiClient } from './meta-api/client.js';
import { TtlCache } from './lib/cache.js';
import { createMcpServer } from './server.js';
import { createAuthMiddleware } from './middleware/auth.js';

export function createApp(config: AppConfig) {
  const logger = createLogger(config.logLevel);
  const metaClient = new MetaApiClient(
    {
      accessToken: config.metaAccessToken,
      appSecret: config.metaAppSecret,
      apiVersion: config.metaApiVersion,
    },
    logger
  );
  const cache = new TtlCache();
  const authMiddleware = createAuthMiddleware(config.mcpAuthToken);

  const app = express();
  app.use(express.json());

  app.post('/mcp', authMiddleware, async (req, res) => {
    const server = createMcpServer(metaClient, cache, logger);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => {
      transport.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.get('/mcp', authMiddleware, async (req, res) => {
    const server = createMcpServer(metaClient, cache, logger);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => {
      transport.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res);
  });

  app.delete('/mcp', authMiddleware, (_req, res) => {
    res.status(204).end();
  });

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      memory: process.memoryUsage().rss,
      version: '1.0.0',
    });
  });

  let deepHealthCache: { result: Record<string, unknown>; expiresAt: number } | null = null;

  app.get('/health/deep', async (_req, res) => {
    const now = Date.now();
    if (deepHealthCache && deepHealthCache.expiresAt > now) {
      res.status(200).json(deepHealthCache.result);
      return;
    }
    const metaOk = await metaClient.checkConnection();
    const result = {
      status: metaOk ? 'ok' : 'degraded',
      meta_api: metaOk ? 'connected' : 'unreachable',
      uptime: process.uptime(),
      checked_at: new Date().toISOString(),
    };
    deepHealthCache = { result, expiresAt: now + 60_000 };
    res.status(metaOk ? 200 : 503).json(result);
  });

  return { app, logger };
}
