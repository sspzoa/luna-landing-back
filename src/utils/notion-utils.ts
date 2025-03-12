// src/utils/notion-utils.ts
import type { Award, Information, Member, NotionResponse, Project, QnA } from '../types';

export function transformMembers(data: NotionResponse): Member[] {
  return data.results.map((item: any) => ({
    id: item.id,
    position: item.properties.position?.select?.name || null,
    image: item.properties.image?.files[0]?.file?.url || null,
    name: item.properties.name?.title[0]?.plain_text || null,
    generation: item.properties.generation?.select?.name || null,
    class: item.properties.class?.select?.name || null,
    description: item.properties.description?.rich_text[0]?.plain_text || null,
    lunaGeneration: item.properties.lunaGeneration?.select?.name || null,
  }));
}

export function transformAwards(data: NotionResponse): Award[] {
  return data.results.map((item: any) => ({
    id: item.id,
    year: item.properties.year?.select?.name || null,
    image: item.properties.image?.files[0]?.file?.url || null,
    name: item.properties.name?.title[0]?.plain_text || null,
    prize: item.properties.prize?.rich_text[0]?.plain_text || null,
    team: item.properties.team?.rich_text[0]?.plain_text || null,
    members: item.properties.members?.multi_select.map((member: { name: string }) => member.name) || [],
    date: item.properties.date?.date || null,
    prizemoney: item.properties.prizemoney?.number || null,
  }));
}

export function transformProjects(data: NotionResponse): Project[] {
  return data.results.map((item: any) => ({
    id: item.id,
    public_url: item.public_url || null,
    year: item.properties.year?.select?.name || null,
    image: item.properties.image?.files[0]?.file?.url || null,
    name: item.properties.name?.title[0]?.plain_text || null,
    description: item.properties.description?.rich_text[0]?.plain_text || null,
    awards:
      item.properties.awards?.multi_select.map((award: { id: string; name: string }) => ({
        id: award.id,
        name: award.name,
      })) || [],
  }));
}

export function transformQnA(data: NotionResponse): QnA[] {
  return data.results.map((item: any) => ({
    id: item.id,
    question: item.properties.question?.title[0]?.plain_text || null,
    order: item.properties.order?.number || null,
    answer: item.properties.answer?.rich_text[0]?.plain_text || null,
  }));
}

export function transformInformation(data: NotionResponse): Information[] {
  return data.results.map((item: any) => ({
    id: item.id,
    moto: item.properties.moto?.title[0]?.plain_text || null,
  }));
}
