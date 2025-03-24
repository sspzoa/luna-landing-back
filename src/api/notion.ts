// src/api/notion.ts
import { DATABASE_IDS } from '../constants';
import type { Award, Information, Member, NotionResponse, NotionSortOption, Project, QnA } from '../types';
import { sqliteCache } from '../utils/sqlite-cache';
import {
  transformAwards,
  transformInformation,
  transformMembers,
  transformProjects,
  transformQnA,
} from '../utils/notion-utils';

async function fetchNotionDatabase(databaseId: string, sorts: NotionSortOption[] = []): Promise<NotionResponse> {
  const cacheKey = `notion_db_${databaseId}_${JSON.stringify(sorts)}`;

  const cachedData = sqliteCache.get<NotionResponse>(cacheKey);
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

    sqliteCache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`Error fetching database ${databaseId}:`, error);
    throw error;
  }
}

export async function fetchAwards(): Promise<Award[]> {
  const cachedData = sqliteCache.get<Award[]>('transformed_awards');
  if (cachedData) {
    console.log('Using cached awards data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.AWARDS, [
    {
      property: 'date',
      direction: 'descending',
    },
    {
      property: 'name',
      direction: 'ascending',
    },
  ]);

  const transformedData = transformAwards(response);
  return transformedData;
}

export async function fetchQnA(): Promise<QnA[]> {
  const cachedData = sqliteCache.get<QnA[]>('transformed_qna');
  if (cachedData) {
    console.log('Using cached QnA data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.QNA, [
    {
      property: 'order',
      direction: 'ascending',
    },
  ]);
  const transformedData = transformQnA(response);

  sqliteCache.set('transformed_qna', transformedData);

  return transformedData;
}

export async function fetchMembers(): Promise<Member[]> {
  const cachedData = sqliteCache.get<Member[]>('transformed_members');
  if (cachedData) {
    console.log('Using cached members data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.MEMBERS, [
    {
      property: 'lunaGeneration',
      direction: 'descending',
    },
    {
      property: 'generation',
      direction: 'descending',
    },
    {
      property: 'name',
      direction: 'ascending',
    },
  ]);
  const transformedData = transformMembers(response);

  return transformedData;
}

export async function fetchInformation(): Promise<Information[]> {
  const cachedData = sqliteCache.get<Information[]>('transformed_information');
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

  sqliteCache.set('transformed_information', updatedInfo);

  return updatedInfo;
}

export async function fetchProjects(): Promise<Project[]> {
  const cachedData = sqliteCache.get<Project[]>('transformed_projects');
  if (cachedData) {
    console.log('Using cached projects data');
    return cachedData;
  }

  const response = await fetchNotionDatabase(DATABASE_IDS.PROJECTS, [
    {
      property: 'name',
      direction: 'ascending',
    },
  ]);
  const transformedData = transformProjects(response);

  return transformedData;
}
