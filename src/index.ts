import { createServer } from './server';
import { logger } from './utils/logger';
import { CONFIG } from './config';

const server = createServer({
  cronIntervalMs: CONFIG.CRON.REFRESH_INTERVAL,
});

logger.info(`Server running at http://${CONFIG.SERVER.HOST}:${server.port}`);

export { server };
