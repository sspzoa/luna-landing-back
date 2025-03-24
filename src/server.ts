// src/integrated-server.ts
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { fetchAwards, fetchInformation, fetchMembers, fetchProjects, fetchQnA } from './api/notion';
import { sqliteCache } from './utils/sqlite-cache';
import { setupCronJob } from './utils/cron';
import { clearImageCache } from './utils/image-utils';

interface ServerOptions {
  port: number;
  publicDir?: string;
  cronIntervalMs?: number;
}

export function startIntegratedServer(options?: Partial<ServerOptions>): void {
  const port = options?.port || Number(process.env.PORT) || 3000;
  const publicDir = options?.publicDir || join(process.cwd(), 'public');

  const server = Bun.serve({
    port,
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

      if (
        path === '/' ||
        path.startsWith('/api/') ||
        ['/awards', '/qna', '/members', '/information', '/projects', '/health', '/clear-cache'].includes(path)
      ) {
        const apiPath = path.startsWith('/api/') ? path.substring(4) : path;

        if (apiPath === '/') {
          return new Response('api.luna.codes', {
            headers: {
              ...corsHeaders,
              'Content-Type': 'text/plain',
            },
          });
        }

        if (apiPath === '/clear-cache' && request.method === 'POST') {
          sqliteCache.clear();
          await clearImageCache();
          return new Response(JSON.stringify({ success: true, message: 'Cache cleared' }), {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          });
        }

        if (apiPath !== '/clear-cache' && request.method !== 'GET') {
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

          switch (apiPath) {
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
                    awards: sqliteCache.has('transformed_awards'),
                    qna: sqliteCache.has('transformed_qna'),
                    members: sqliteCache.has('transformed_members'),
                    information: sqliteCache.has('transformed_information'),
                    projects: sqliteCache.has('transformed_projects'),
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
              break;
          }

          if (data) {
            return new Response(JSON.stringify(data), {
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            });
          }
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
      }

      let filePath = path;

      if (filePath.startsWith('/')) {
        filePath = filePath.substring(1);
      }

      if (!filePath) {
        filePath = 'index.html';
      }

      const fullPath = join(publicDir, filePath);

      if (!existsSync(fullPath)) {
        return new Response('File not found', {
          status: 404,
          headers: corsHeaders,
        });
      }

      const extension = filePath.split('.').pop()?.toLowerCase() || '';
      let contentType = 'application/octet-stream';

      switch (extension) {
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'svg':
          contentType = 'image/svg+xml';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'css':
          contentType = 'text/css';
          break;
        case 'js':
          contentType = 'text/javascript';
          break;
        case 'html':
          contentType = 'text/html';
          break;
        case 'json':
          contentType = 'application/json';
          break;
      }

      try {
        const file = Bun.file(fullPath);

        return new Response(file, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error(`Error serving file ${fullPath}:`, error);
        return new Response('Error serving file', {
          status: 500,
          headers: corsHeaders,
        });
      }
    },
  });

  console.log(`Integrated server running at http://localhost:${server.port}`);

  const cronInterval = options?.cronIntervalMs || 30 * 60 * 1000;
  setupCronJob(cronInterval);
}
