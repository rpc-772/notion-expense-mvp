import { Client } from '@notionhq/client';
import { getEnv } from '../config/env';

let _client: Client | null = null;

export function getNotionClient(): Client {
  if (!_client) {
    _client = new Client({ auth: getEnv().NOTION_TOKEN });
  }
  return _client;
}
