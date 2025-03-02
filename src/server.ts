// src/server.ts
import { fetchAwards, fetchInformation, fetchMembers, fetchProjects, fetchQnA } from './api/notion';
import { memoryCache } from './utils/cache-utils';
import { setupCronJob } from './utils/cron';

interface ServerOptions {
  port: number;
  cronIntervalMs?: number;
}

export function startServer(options?: Partial<ServerOptions>): void {
  const server = Bun.serve({
    port: options?.port || Number(process.env.PORT) || 3002,
    async fetch(request) {
      const url = new URL(request.url);
      const path = url.pathname;

      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }

      if (path === '/') {
        return new Response('api.luna.codes', {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/plain',
          },
        });
      }

      if (path === '/clear-cache' && request.method === 'POST') {
        memoryCache.clear();
        return new Response(JSON.stringify({ success: true, message: 'Cache cleared' }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }

      if (path !== '/clear-cache' && request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }

      try {
        // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
        let data;

        switch (path) {
          case '/awards':
            data = await fetchAwards();
            break;
          case '/qna':
            data = await fetchQnA();
            break;
          case '/members':
            data = await fetchMembers();
            break;
          case '/information':
            data = await fetchInformation();
            break;
          case '/projects':
            data = await fetchProjects();
            break;
          case '/health':
            return new Response(
              JSON.stringify({
                status: 'ok',
                cacheStatus: {
                  awards: memoryCache.has('transformed_awards'),
                  qna: memoryCache.has('transformed_qna'),
                  members: memoryCache.has('transformed_members'),
                  information: memoryCache.has('transformed_information'),
                  projects: memoryCache.has('transformed_projects'),
                },
              }),
              {
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json',
                },
              },
            );
          default:
            return new Response(JSON.stringify({ error: 'Not found' }), {
              status: 404,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            });
        }

        return new Response(JSON.stringify(data), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      } catch (error: any) {
        console.error('API error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }
    },
  });

  console.log(`Server running at http://localhost:${server.port}`);

  const cronInterval = options?.cronIntervalMs || 30 * 60 * 1000;
  setupCronJob(cronInterval);
}
