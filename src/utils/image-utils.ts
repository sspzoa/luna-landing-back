// src/utils/image-utils.ts
import { mkdir, writeFile, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const IMAGE_DIR = join(process.cwd(), 'public', 'images');
const SERVER_BASE = process.env.SERVER_URL || 'http://localhost:3000';

async function ensureImageDirExists() {
  if (!existsSync(IMAGE_DIR)) {
    await mkdir(IMAGE_DIR, { recursive: true });
  }
}

function normalizeEntityType(type: string): string {
  return type.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function generateImageFilename(entityType: string, entityId: string, originalUrl: string): string {
  const originalExt = extname(new URL(originalUrl).pathname).toLowerCase() || '.jpg';
  const ext = originalExt.startsWith('.') ? originalExt.substring(1) : originalExt;

  const cleanId = entityId.replace(/[^a-zA-Z0-9]/g, '');

  return `${normalizeEntityType(entityType)}_${cleanId}.${ext}`;
}

export async function downloadAndStoreImage(
  imageUrl: string | null,
  entityType: string,
  entityId: string,
): Promise<string | null> {
  if (!imageUrl) return null;

  try {
    await ensureImageDirExists();

    const filename = generateImageFilename(entityType, entityId, imageUrl);
    const localPath = join(IMAGE_DIR, filename);

    if (!existsSync(localPath)) {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }

      const imageBuffer = await response.arrayBuffer();
      await writeFile(localPath, Buffer.from(imageBuffer));
      console.log(`Downloaded image for ${entityType} ${entityId} from ${imageUrl} to ${localPath}`);
    }

    return `${SERVER_BASE}/images/${filename}`;
  } catch (error) {
    console.error(`Error downloading image for ${entityType} ${entityId} from ${imageUrl}:`, error);
    return imageUrl;
  }
}

export async function clearImageCache(): Promise<void> {
  if (!existsSync(IMAGE_DIR)) {
    return;
  }

  try {
    const files = await readdir(IMAGE_DIR);
    for (const file of files) {
      const filePath = join(IMAGE_DIR, file);
      await rm(filePath, { force: true });
    }
    console.log(`Cleared ${files.length} images from cache`);
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
}
