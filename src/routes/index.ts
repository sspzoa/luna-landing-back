import { corsHeaders } from '../middleware/cors';
import { cache } from '../utils/cache';
import { logger } from '../utils/logger';
import { fetchAwards, fetchInformation, fetchMembers, fetchProjects, fetchQnA } from '../services/notion';

export async function handleHealthCheck(): Promise<Response> {
  const healthData = {
    status: 'ok',
    cacheStatus: {
      awards: cache.has('transformed_awards'),
      qna: cache.has('transformed_qna'),
      members: cache.has('transformed_members'),
      information: cache.has('transformed_information'),
      projects: cache.has('transformed_projects'),
    },
  };

  return new Response(JSON.stringify(healthData), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export async function handleClearCache(): Promise<Response> {
  cache.clear();

  return new Response(JSON.stringify({ success: true, message: 'Cache cleared successfully' }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export async function handleAwards(): Promise<Response> {
  try {
    const data = await fetchAwards();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logger.error('Error fetching awards:', error);
    throw error;
  }
}

export async function handleQnA(): Promise<Response> {
  try {
    const data = await fetchQnA();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logger.error('Error fetching QnA:', error);
    throw error;
  }
}

export async function handleMembers(): Promise<Response> {
  try {
    const data = await fetchMembers();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logger.error('Error fetching members:', error);
    throw error;
  }
}

export async function handleInformation(): Promise<Response> {
  try {
    const data = await fetchInformation();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logger.error('Error fetching information:', error);
    throw error;
  }
}

export async function handleProjects(): Promise<Response> {
  try {
    const data = await fetchProjects();

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    throw error;
  }
}
