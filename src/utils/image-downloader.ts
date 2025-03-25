// src/utils/image-downloader.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Award, Member, Project } from '../types';

const STATIC_DIR = path.join(process.cwd(), 'public/images');
const BASE_URL = process.env.API_BASE_URL || 'https://api.luna.codes';

export function ensureStaticDir() {
  if (!fs.existsSync(STATIC_DIR)) {
    fs.mkdirSync(STATIC_DIR, { recursive: true });
  }
}

export function clearStaticDir() {
  if (fs.existsSync(STATIC_DIR)) {
    const files = fs.readdirSync(STATIC_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(STATIC_DIR, file));
    }
  }
  ensureStaticDir();
}

async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const filePath = path.join(STATIC_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));

    return `${BASE_URL}/images/${filename}`;
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
    return '';
  }
}

export async function downloadMemberImages(members: Member[]): Promise<Member[]> {
  return await Promise.all(
    members.map(async (member) => {
      if (member.image) {
        const filename = `member_${member.id}.jpg`;
        const localPath = await downloadImage(member.image, filename);
        return { ...member, image: localPath || member.image };
      }
      return member;
    }),
  );
}

export async function downloadAwardImages(awards: Award[]): Promise<Award[]> {
  return await Promise.all(
    awards.map(async (award) => {
      if (award.image) {
        const filename = `award_${award.id}.jpg`;
        const localPath = await downloadImage(award.image, filename);
        return { ...award, image: localPath || award.image };
      }
      return award;
    }),
  );
}

export async function downloadProjectImages(projects: Project[]): Promise<Project[]> {
  return await Promise.all(
    projects.map(async (project) => {
      if (project.image) {
        const filename = `project_${project.id}.jpg`;
        const localPath = await downloadImage(project.image, filename);
        return { ...project, image: localPath || project.image };
      }
      return project;
    }),
  );
}
