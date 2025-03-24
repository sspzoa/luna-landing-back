// src/types/index.ts
export interface NotionSortOption {
  property: string;
  direction: 'ascending' | 'descending';
}

export interface NotionResponse {
  results: any[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface Member {
  id: string;
  position?: string;
  image?: string;
  name?: string;
  generation?: string;
  class?: string;
  description?: string;
  lunaGeneration?: string;
}

export interface Award {
  id: string;
  year?: string;
  image?: string;
  name?: string;
  prize?: string;
  team?: string;
  members?: string[];
  date?: {
    start: string;
    end?: string;
  };
  prizemoney?: string;
}

export interface Project {
  id: string;
  public_url: string;
  year?: string;
  image?: string;
  name?: string;
  description?: string;
  awards?: Array<{ id: string; name: string }>;
}

export interface QnA {
  id: string;
  question?: string;
  order?: number;
  answer?: string;
}

export interface Information {
  id: string;
  moto?: string;
  contests?: string;
  projects?: string;
  prizemoney?: string;
}
