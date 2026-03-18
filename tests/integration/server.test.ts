import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { AppConfig } from '../../src/lib/config.js';
import { createApp } from '../../src/app.js';

describe('Server integration', () => {
  let app: ReturnType<typeof createApp>['app'];
  const config: AppConfig = {
    metaAccessToken: 'test-meta-token',
    mcpAuthToken: 'test-mcp-token',
    metaApiVersion: 'v25.0',
    port: 0,
    logLevel: 'silent',
  };

  beforeAll(() => {
    const { app: appInstance } = createApp(config);
    app = appInstance;
  });

  it('GET_health_200_status_version', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', version: '1.0.0' });
    expect(typeof res.body.uptime).toBe('number');
  });

  it('POST_mcp_인증없음_401', async () => {
    const res = await request(app).post('/mcp').send({});
    expect(res.status).toBe(401);
  });

  it('POST_mcp_잘못된토큰_403', async () => {
    const res = await request(app)
      .post('/mcp')
      .set('Authorization', 'Bearer wrong-token')
      .send({});
    expect(res.status).toBe(403);
  });

  it('POST_mcp_인증성공_MetaToken없음_400', async () => {
    const noMetaConfig: AppConfig = { ...config, metaAccessToken: undefined };
    const { app: noMetaApp } = createApp(noMetaConfig);

    const res = await request(noMetaApp)
      .post('/mcp')
      .set('Authorization', 'Bearer test-mcp-token')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Meta access token');
  });

  it('POST_mcp_X-Meta-Access-Token헤더_폴백우선', async () => {
    const noMetaConfig: AppConfig = { ...config, metaAccessToken: undefined };
    const { app: noMetaApp } = createApp(noMetaConfig);

    const res = await request(noMetaApp)
      .post('/mcp')
      .set('Authorization', 'Bearer test-mcp-token')
      .set('X-Meta-Access-Token', 'user-specific-token')
      .send({ jsonrpc: '2.0', method: 'initialize', id: 1, params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1.0' } } });

    expect(res.status).not.toBe(400);
  });

  it('DELETE_mcp_인증없음_401', async () => {
    const res = await request(app).delete('/mcp');
    expect(res.status).toBe(401);
  });
});
