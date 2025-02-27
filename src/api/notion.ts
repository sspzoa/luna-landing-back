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

async function fetchNotionDatabase(
  databaseId: string,
  sorts: NotionSortOption[] = []
): Promise<NotionResponse> {
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

    return await res.json() as NotionResponse;
  } catch (error) {
    console.error(`Error fetching database ${databaseId}:`, error);
    throw error;
  }
}

export async function fetchAwards(): Promise<Award[]> {
  const response = await fetchNotionDatabase(DATABASE_IDS.AWARDS, [
    {
      property: 'date',
      direction: 'descending'
    }
  ]);
  return transformAwards(response);
}

export async function fetchQnA(): Promise<QnA[]> {
  const response = await fetchNotionDatabase(DATABASE_IDS.QNA);
  return transformQnA(response);
}

export async function fetchMembers(): Promise<Member[]> {
  const response = await fetchNotionDatabase(DATABASE_IDS.MEMBERS);
  return transformMembers(response);
}

export async function fetchInformation(): Promise<Information[]> {
  const response = await fetchNotionDatabase(DATABASE_IDS.INFORMATION);
  return transformInformation(response);
}

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetchNotionDatabase(DATABASE_IDS.PROJECTS);
  return transformProjects(response);
}