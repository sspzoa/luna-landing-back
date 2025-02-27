// src/server.ts
import {
  fetchAwards,
  fetchQnA,
  fetchMembers,
  fetchInformation,
  fetchProjects
} from './api/notion';

interface ServerOptions {
  port: number;
}

/**
 * Create and start the server
 */
export function startServer(options?: Partial<ServerOptions>): void {
  const server = Bun.serve({
    port: options?.port || Number(process.env.PORT) || 3000,
    async fetch(request) {
      // Get the URL path
      const url = new URL(request.url);
      const path = url.pathname;

      // CORS headers
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json"
      };

      // Handle OPTIONS request (CORS preflight)
      if (request.method === "OPTIONS") {
        return new Response(null, { headers });
      }

      // Make sure it's a GET request
      if (request.method !== "GET") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers
        });
      }

      try {
        let data;

        // Route to the correct database based on the path
        switch (path) {
          case "/api/awards":
            data = await fetchAwards();
            break;
          case "/api/qna":
            data = await fetchQnA();
            break;
          case "/api/members":
            data = await fetchMembers();
            break;
          case "/api/information":
            data = await fetchInformation();
            break;
          case "/api/projects":
            data = await fetchProjects();
            break;
          case "/api/health":
            return new Response(JSON.stringify({ status: "ok" }), { headers });
          default:
            return new Response(JSON.stringify({ error: "Not found" }), {
              status: 404,
              headers
            });
        }

        return new Response(JSON.stringify(data), { headers });
      } catch (error: any) {
        console.error("API error:", error);
        return new Response(
          JSON.stringify({ error: "Internal server error", message: error.message }),
          { status: 500, headers }
        );
      }
    },
  });

  console.log(`Server running at http://localhost:${server.port}`);
}