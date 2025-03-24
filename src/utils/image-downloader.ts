// src/utils/image-downloader.ts
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { Award, Member, Project } from '../types';

const STATIC_DIR = path.join(process.cwd(), 'public/images');
const BASE_URL = process.env.API_BASE_URL || 'https://api.luna.codes';
const QUALITY = {
  jpg: 80,
  png: 8,
  webp: 75,
};
const MAX_WIDTH = 1200;

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

function getFileExtension(url: string): string {
  const urlPath = new URL(url).pathname;
  const extension = path.extname(urlPath).toLowerCase();

  if (!extension || !['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(extension)) {
    return '.jpg';
  }

  return extension;
}

async function optimizeAndSaveImage(buffer: Buffer, extension: string, filePath: string): Promise<void> {
  if (extension === '.svg') {
    fs.writeFileSync(filePath, buffer);
    return;
  }

  let sharpInstance = sharp(buffer).withMetadata();

  const metadata = await sharpInstance.metadata();
  if (metadata.width && metadata.width > MAX_WIDTH) {
    sharpInstance = sharpInstance.resize(MAX_WIDTH);
  }

  switch (extension) {
    case '.jpg':
    case '.jpeg':
      await sharpInstance.jpeg({ quality: QUALITY.jpg }).toFile(filePath);
      break;
    case '.png':
      await sharpInstance.png({ compressionLevel: QUALITY.png }).toFile(filePath);
      break;
    case '.webp':
      await sharpInstance.webp({ quality: QUALITY.webp }).toFile(filePath);
      break;
    case '.gif':
      await sharpInstance.toFile(filePath);
      break;
    default:
      await sharpInstance.jpeg({ quality: QUALITY.jpg }).toFile(filePath);
  }
}

async function downloadImage(url: string, baseFilename: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    let extension = getFileExtension(url);

    if (contentType) {
      if (contentType.includes('image/jpeg')) extension = '.jpg';
      else if (contentType.includes('image/png')) extension = '.png';
      else if (contentType.includes('image/gif')) extension = '.gif';
      else if (contentType.includes('image/webp')) extension = '.webp';
      else if (contentType.includes('image/svg+xml')) extension = '.svg';
    }

    const filename = `${baseFilename}${extension}`;
    const buffer = await response.arrayBuffer();
    const filePath = path.join(STATIC_DIR, filename);

    await optimizeAndSaveImage(Buffer.from(buffer), extension, filePath);

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
        const baseFilename = `member_${member.id}`;
        const localPath = await downloadImage(member.image, baseFilename);
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
        const baseFilename = `award_${award.id}`;
        const localPath = await downloadImage(award.image, baseFilename);
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
        const baseFilename = `project_${project.id}`;
        const localPath = await downloadImage(project.image, baseFilename);
        return { ...project, image: localPath || project.image };
      }
      return project;
    }),
  );
}
