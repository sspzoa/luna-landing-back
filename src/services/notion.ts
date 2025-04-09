import { CONFIG } from '../config';
import type { Award, Information, Member, NotionResponse, NotionSortOption, Project, QnA } from '../types';
import { cache } from '../utils/cache';
import { logger } from '../utils/logger';
import {
  calculateTotalPrizeMoney,
  transformAwards,
  transformInformation,
  transformMembers,
  transformProjects,
  transformQnA,
} from '../utils/notion';

export class NotionApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly databaseId?: string,
  ) {
    super(message);
    this.name = 'NotionApiError';
  }
}

async function fetchNotionDatabase(databaseId: string, sorts: NotionSortOption[] = []): Promise<NotionResponse> {
  const cacheKey = `notion_db_${databaseId}_${JSON.stringify(sorts)}`;

  const cachedData = cache.get<NotionResponse>(cacheKey);
  if (cachedData) {
    logger.info(`Using cached data for database ${databaseId}`);
    return cachedData;
  }

  try {
    const url = `${CONFIG.NOTION.API_URL}/databases/${databaseId}/query`;
    logger.debug(`Fetching Notion database: ${url}`);

    const res = await fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
        'Notion-Version': CONFIG.NOTION.API_VERSION,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      },
      body: JSON.stringify({ sorts }),
    });

    if (!res.ok) {
      throw new NotionApiError(res.status, `Notion API error: ${res.status} ${res.statusText}`, databaseId);
    }

    const data = (await res.json()) as NotionResponse;

    cache.set(cacheKey, data);
    logger.info(`Successfully fetched and cached database ${databaseId}`);

    return data;
  } catch (error) {
    logger.error(`Error fetching database ${databaseId}:`, error);
    throw error;
  }
}

export async function fetchAwards(): Promise<Award[]> {
  const cacheKey = 'transformed_awards';

  const cachedData = cache.get<Award[]>(cacheKey);
  if (cachedData) {
    logger.info('Using cached awards data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(CONFIG.NOTION.DATABASE_IDS.AWARDS, [
    { property: 'date', direction: 'descending' },
    { property: 'name', direction: 'ascending' },
  ]);

  const transformedData = transformAwards(response);

  cache.set(cacheKey, transformedData);
  logger.info(`Transformed and cached ${transformedData.length} awards`);

  return transformedData;
}

export async function fetchQnA(): Promise<QnA[]> {
  const cacheKey = 'transformed_qna';

  const cachedData = cache.get<QnA[]>(cacheKey);
  if (cachedData) {
    logger.info('Using cached QnA data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(CONFIG.NOTION.DATABASE_IDS.QNA, [
    { property: 'order', direction: 'ascending' },
  ]);

  const transformedData = transformQnA(response);

  cache.set(cacheKey, transformedData);
  logger.info(`Transformed and cached ${transformedData.length} QnAs`);

  return transformedData;
}

export async function fetchMembers(): Promise<Member[]> {
  const cacheKey = 'transformed_members';

  const cachedData = cache.get<Member[]>(cacheKey);
  if (cachedData) {
    logger.info('Using cached members data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(CONFIG.NOTION.DATABASE_IDS.MEMBERS, [
    { property: 'lunaGeneration', direction: 'descending' },
    { property: 'generation', direction: 'descending' },
    { property: 'name', direction: 'ascending' },
  ]);

  const transformedData = transformMembers(response);

  cache.set(cacheKey, transformedData);
  logger.info(`Transformed and cached ${transformedData.length} members`);

  return transformedData;
}

export async function fetchProjects(): Promise<Project[]> {
  const cacheKey = 'transformed_projects';

  const cachedData = cache.get<Project[]>(cacheKey);
  if (cachedData) {
    logger.info('Using cached projects data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(CONFIG.NOTION.DATABASE_IDS.PROJECTS, [
    { property: 'name', direction: 'ascending' },
  ]);

  const transformedData = transformProjects(response);

  cache.set(cacheKey, transformedData);
  logger.info(`Transformed and cached ${transformedData.length} projects`);

  return transformedData;
}

export async function fetchInformation(): Promise<Information[]> {
  const cacheKey = 'transformed_information';

  const cachedData = cache.get<Information[]>(cacheKey);
  if (cachedData) {
    logger.info('Using cached information data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(CONFIG.NOTION.DATABASE_IDS.INFORMATION);
  const baseInfo = transformInformation(response);

  // Get dependent data
  const awards = await fetchAwards();
  const projects = await fetchProjects();

  // Calculate totals
  const totalPrizeMoney = calculateTotalPrizeMoney(awards);

  // Enhance information with calculated data
  const updatedInfo = baseInfo.map((info) => ({
    ...info,
    contests: (awards.length + 40).toString(),
    projects: (projects.length + 23).toString(),
    prizemoney: `${(totalPrizeMoney + 75000000).toString().slice(0, -6)}00`,
  }));

  cache.set(cacheKey, updatedInfo);
  logger.info('Transformed and cached information data');

  return updatedInfo;
}
