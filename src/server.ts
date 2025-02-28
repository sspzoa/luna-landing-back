// src/server.ts
import { fetchAwards, fetchInformation, fetchMembers, fetchProjects, fetchQnA } from './api/notion';
import { memoryCache } from './utils/cache-utils';

interface ServerOptions {
  port: number;
}

export function startServer(options?: Partial<ServerOptions>): void {
  const server = Bun.serve({
    port: options?.port || Number(process.env.PORT) || 3002,
    async fetch(request) {
      const url = new URL(request.url);
      const path = url.pathname;

      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
      }

      if (path === '/api/clear-cache' && request.method === 'POST') {
        memoryCache.clear();
        return new Response(JSON.stringify({ success: true, message: 'Cache cleared' }), { headers });
      }

      if (path !== '/api/clear-cache' && request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers,
        });
      }

      try {
        // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
        let data;

        switch (path) {
          case '/api/awards':
            data = await fetchAwards();
            break;
          case '/api/qna':
            data = await fetchQnA();
            break;
          case '/api/members':
            data = await fetchMembers();
            break;
          case '/api/information':
            data = await fetchInformation();
            break;
          case '/api/projects':
            data = await fetchProjects();
            break;
          case '/api/health':
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
              { headers },
            );
          default:
            return new Response(JSON.stringify({ error: 'Not found' }), {
              status: 404,
              headers,
            });
        }

        return new Response(JSON.stringify(data), { headers });
      } catch (error: any) {
        console.error('API error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error', message: error.message }), {
          status: 500,
          headers,
        });
      }
    },
  });

  console.log(`Server running at http://localhost:${server.port}`);
}
