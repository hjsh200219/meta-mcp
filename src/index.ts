import { loadAndValidateConfig } from './lib/config.js';
import { createApp } from './app.js';

const config = loadAndValidateConfig();
const { app, logger } = createApp(config);

const httpServer = app.listen(config.port, '0.0.0.0', () => {
  logger.info({ port: config.port }, 'MCP server started');
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000);
});

export { app, httpServer };
