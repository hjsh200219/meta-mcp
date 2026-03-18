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
    logLevel: 'info',
  };

  beforeAll(() => {
    const { app: appInstance } = createApp(config);
    app = appInstance;
  });

  it('GET_health_200_status_uptime_memory_version', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      version: '1.0.0',
    });
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.memory).toBe('number');
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

  it('DELETE_mcp_인증없음_401', async () => {
    const res = await request(app).delete('/mcp');

    expect(res.status).toBe(401);
  });
});
