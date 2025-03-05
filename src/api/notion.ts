// src/api/notion.ts
import { DATABASE_IDS } from '../constants';
import type { Award, Information, Member, NotionResponse, NotionSortOption, Project, QnA } from '../types';
import { memoryCache } from '../utils/cache-utils';
import {
  transformAwards,
  transformInformation,
  transformMembers,
  transformProjects,
  transformQnA,
} from '../utils/notion-utils';

async function fetchNotionDatabase(databaseId: string, sorts: NotionSortOption[] = []): Promise<NotionResponse> {
  const cacheKey = `notion_db_${databaseId}_${JSON.stringify(sorts)}`;

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
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      },
      body: JSON.stringify({ sorts }),
    });

    if (!res.ok) {
      throw new Error(`Notion API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as NotionResponse;

    memoryCache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`Error fetching database ${databaseId}:`, error);
    throw error;
  }
}

export async function fetchAwards(): Promise<Award[]> {
  const cacheKey = 'transformed_awards';

  const cachedData = memoryCache.get<Award[]>(cacheKey);
  if (cachedData) {
    console.log('Using cached awards data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.AWARDS, [
    {
      property: 'date',
      direction: 'descending',
    },
  ]);

  const transformedData = transformAwards(response);

  memoryCache.set(cacheKey, transformedData);

  return transformedData;
}

export async function fetchQnA(): Promise<QnA[]> {
  const cacheKey = 'transformed_qna';

  const cachedData = memoryCache.get<QnA[]>(cacheKey);
  if (cachedData) {
    console.log('Using cached QnA data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.QNA);
  const transformedData = transformQnA(response);

  memoryCache.set(cacheKey, transformedData);

  return transformedData;
}

export async function fetchMembers(): Promise<Member[]> {
  const cacheKey = 'transformed_members';

  const cachedData = memoryCache.get<Member[]>(cacheKey);
  if (cachedData) {
    console.log('Using cached members data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.MEMBERS);
  const transformedData = transformMembers(response);

  memoryCache.set(cacheKey, transformedData);

  return transformedData;
}

export async function fetchInformation(): Promise<Information[]> {
  const cacheKey = 'transformed_information';

  const cachedData = memoryCache.get<Information[]>(cacheKey);
  if (cachedData) {
    console.log('Using cached information data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.INFORMATION);
  const baseInfo = transformInformation(response);

  const awards = await fetchAwards();
  const projects = await fetchProjects();

  let totalPrizeMoney = 0;
  for (const award of awards) {
    if (award.prizemoney) {
      const prizeValue = Number(award.prizemoney);
      if (!Number.isNaN(prizeValue)) {
        totalPrizeMoney += prizeValue;
      }
    }
  }

  const updatedInfo = baseInfo.map((info) => ({
    ...info,
    contests: (awards.length + 40).toString(),
    projects: (projects.length + 23).toString(),
    prizemoney: `${(totalPrizeMoney + 75000000).toString().slice(0, -6)}00`,
  }));

  memoryCache.set(cacheKey, updatedInfo);

  return updatedInfo;
}

export async function fetchProjects(): Promise<Project[]> {
  const cacheKey = 'transformed_projects';

  const cachedData = memoryCache.get<Project[]>(cacheKey);
  if (cachedData) {
    console.log('Using cached projects data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.PROJECTS);
  const transformedData = transformProjects(response);

  memoryCache.set(cacheKey, transformedData);

  return transformedData;
}
