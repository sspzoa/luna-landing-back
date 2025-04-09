import { corsHeaders } from './cors';
import { logger } from '../utils/logger';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleError(error: unknown): Response {
  logger.error('Error handling request:', error);

  if (error instanceof ApiError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }

  const message = error instanceof Error ? error.message : String(error);
  return new Response(JSON.stringify({ error: 'Internal server error', message }), {
    status: 500,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
