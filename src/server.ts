import { serve } from 'bun';
import { CONFIG } from './config';
import { logger } from './utils/logger';
import { handleCors } from './middleware/cors';
import { handleError, ApiError } from './middleware/error';
import {
  handleHealthCheck,
  handleClearCache,
  handleAwards,
  handleQnA,
  handleMembers,
  handleInformation,
  handleProjects,
} from './routes';
import { setupRefreshJob } from './jobs/refreshData';

interface ServerOptions {
  port?: number;
  cronIntervalMs?: number;
}

export function createServer(options: ServerOptions = {}) {
  const port = options.port || CONFIG.SERVER.PORT;
  const cronInterval = options.cronIntervalMs || CONFIG.CRON.REFRESH_INTERVAL;

  setupRefreshJob(cronInterval);

  return serve({
    port,

    async fetch(req: Request) {
      const url = new URL(req.url);
      const path = url.pathname;

      try {
        const corsResponse = handleCors(req);
        if (corsResponse) return corsResponse;

        if (path === '/') {
          return new Response('api.luna.codes', {
            headers: { 'Content-Type': 'text/plain' },
          });
        }

        if (path !== '/clear-cache' && req.method !== 'GET') {
          throw new ApiError(405, 'Method not allowed');
        }

        if (path === '/health') {
          return await handleHealthCheck();
        }

        if (path === '/clear-cache' && req.method === 'POST') {
          return await handleClearCache();
        }

        if (path === '/awards') {
          return await handleAwards();
        }

        if (path === '/qna') {
          return await handleQnA();
        }

        if (path === '/members') {
          return await handleMembers();
        }

        if (path === '/information') {
          return await handleInformation();
        }

        if (path === '/projects') {
          return await handleProjects();
        }

        throw new ApiError(404, 'Endpoint not found');
      } catch (error) {
        return handleError(error);
      }
    },
  });
}
