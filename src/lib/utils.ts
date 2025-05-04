// src/lib/utils.ts
import { promises as fs } from 'fs';
import { join } from 'path';

const BASE_UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function ensureUploadDirs() {
  try {
    await fs.access(BASE_UPLOAD_DIR);
  } catch {
    await fs.mkdir(BASE_UPLOAD_DIR, { recursive: true });
  }

  const dirs = ['certificate_file', 'contracts'];
  for (const dir of dirs) {
    const fullPath = join(BASE_UPLOAD_DIR, dir);
    try {
      await fs.access(fullPath);
    } catch {
      await fs.mkdir(fullPath, { recursive: true });
    }
  }
}