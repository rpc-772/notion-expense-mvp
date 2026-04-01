import dotenv from 'dotenv';

dotenv.config();

export function getEnv() {
  return {
    NOTION_TOKEN: process.env.NOTION_TOKEN ?? '',
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID ?? '',
  };
}

export function validateEnv(): void {
  const env = getEnv();
  if (!env.NOTION_TOKEN) {
    throw new Error('Missing NOTION_TOKEN in environment variables');
  }
  if (!env.NOTION_DATABASE_ID) {
    throw new Error('Missing NOTION_DATABASE_ID in environment variables');
  }
}
