import { getNotionClient } from './client';
import { getEnv } from '../config/env';
import { NOTION_FIELDS } from '../config/fields';
import { ExpenseInput } from '../types/expense';

type NotionProperties = Record<string, unknown>;

/**
 * 将 ExpenseInput 转换为 Notion properties 对象
 * 空值字段不传给 Notion
 */
export function buildNotionProperties(input: ExpenseInput): NotionProperties {
  const props: NotionProperties = {
    [NOTION_FIELDS.item_name]: {
      title: [{ text: { content: input.item_name } }],
    },
    [NOTION_FIELDS.amount]: {
      number: input.amount,
    },
    [NOTION_FIELDS.date]: {
      date: { start: input.date },
    },
  };

  if (input.category) {
    props[NOTION_FIELDS.category] = {
      select: { name: input.category },
    };
  }

  if (input.mood) {
    props[NOTION_FIELDS.mood] = {
      select: { name: input.mood },
    };
  }

  if (input.note) {
    props[NOTION_FIELDS.note] = {
      rich_text: [{ text: { content: input.note } }],
    };
  }

  return props;
}

/**
 * 创建一条支出记录页面到 Notion 数据库
 */
export async function createExpensePage(input: ExpenseInput): Promise<string> {
  const notion = getNotionClient();
  const properties = buildNotionProperties(input);

  const page = await notion.pages.create({
    parent: { database_id: getEnv().NOTION_DATABASE_ID },
    properties: properties as any,
  });

  return page.id;
}
