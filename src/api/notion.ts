// src/api/notion.ts
import { DATABASE_IDS } from '../constants';
import type {NotionSortOption, NotionResponse, Award, QnA, Member, Information, Project} from '../types';
import {
  transformMembers,
  transformAwards,
  transformProjects,
  transformQnA,
  transformInformation,
} from '../utils/notion-utils';
import { memoryCache } from '../utils/cache-utils';

async function fetchNotionDatabase(
  databaseId: string,
  sorts: NotionSortOption[] = []
): Promise<NotionResponse> {
  const cacheKey = `notion_db_${databaseId}_${JSON.stringify(sorts)}`;

  // Check if we have a cached version
  const cachedData = memoryCache.get<NotionResponse>(cacheKey);
  if (cachedData) {
    console.log(`Using cached data for database ${databaseId}`);
    return cachedData;
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
        'Notion-Version': '2022-02-22',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`
      },
      body: JSON.stringify({sorts})
    });

    if (!res.ok) {
      throw new Error(`Notion API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json() as NotionResponse;

    // Store in cache
    memoryCache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`Error fetching database ${databaseId}:`, error);
    throw error;
  }
}

export async function fetchAwards(): Promise<Award[]> {
  const cacheKey = 'transformed_awards';

  // Check if we have a cached version
  const cachedData = memoryCache.get<Award[]>(cacheKey);
  if (cachedData) {
    console.log('Using cached awards data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.AWARDS, [
    {
      property: 'date',
      direction: 'descending'
    }
  ]);

  const transformedData = transformAwards(response);

  // Store in cache
  memoryCache.set(cacheKey, transformedData);

  return transformedData;
}

export async function fetchQnA(): Promise<QnA[]> {
  const cacheKey = 'transformed_qna';

  // Check if we have a cached version
  const cachedData = memoryCache.get<QnA[]>(cacheKey);
  if (cachedData) {
    console.log('Using cached QnA data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.QNA);
  const transformedData = transformQnA(response);

  // Store in cache
  memoryCache.set(cacheKey, transformedData);

  return transformedData;
}

export async function fetchMembers(): Promise<Member[]> {
  const cacheKey = 'transformed_members';

  // Check if we have a cached version
  const cachedData = memoryCache.get<Member[]>(cacheKey);
  if (cachedData) {
    console.log('Using cached members data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.MEMBERS);
  const transformedData = transformMembers(response);

  // Store in cache
  memoryCache.set(cacheKey, transformedData);

  return transformedData;
}

export async function fetchInformation(): Promise<Information[]> {
  const cacheKey = 'transformed_information';

  // Check if we have a cached version
  const cachedData = memoryCache.get<Information[]>(cacheKey);
  if (cachedData) {
    console.log('Using cached information data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.INFORMATION);
  const transformedData = transformInformation(response);

  // Store in cache
  memoryCache.set(cacheKey, transformedData);

  return transformedData;
}

export async function fetchProjects(): Promise<Project[]> {
  const cacheKey = 'transformed_projects';

  // Check if we have a cached version
  const cachedData = memoryCache.get<Project[]>(cacheKey);
  if (cachedData) {
    console.log('Using cached projects data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.PROJECTS);
  const transformedData = transformProjects(response);

  // Store in cache
  memoryCache.set(cacheKey, transformedData);

  return transformedData;
}