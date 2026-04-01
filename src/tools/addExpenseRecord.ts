import { z } from 'zod/v4';
import { createExpensePage } from '../notion/expenseDb';
import { AddExpenseResult, ExpenseInput } from '../types/expense';

const ExpenseSchema = z.object({
  item_name: z.string().min(1, '项目名称不能为空'),
  amount: z.number().positive('金额必须大于 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD'),
  category: z.string().nullable().optional(),
  mood: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

export async function addExpenseRecord(
  input: ExpenseInput
): Promise<AddExpenseResult> {
  // 校验
  const parsed = ExpenseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: 'INVALID_INPUT',
        message: parsed.error.issues.map((i) => i.message).join('; '),
      },
    };
  }

  try {
    const pageId = await createExpensePage(input);
    return {
      ok: true,
      record: {
        item_name: input.item_name,
        amount: input.amount,
        date: input.date,
      },
      notion_page_id: pageId,
    };
  } catch (err: any) {
    // 区分 Notion 错误类型
    const message = err?.message ?? String(err);

    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        ok: false,
        error: { code: 'NOTION_AUTH_ERROR', message: 'Notion Token 无效或已过期' },
      };
    }
    if (message.includes('Could not find database') || message.includes('404')) {
      return {
        ok: false,
        error: { code: 'NOTION_API_ERROR', message: 'Notion 数据库未找到，请检查 DATABASE_ID' },
      };
    }
    if (message.includes('property') || message.includes('schema')) {
      return {
        ok: false,
        error: { code: 'DATABASE_SCHEMA_MISMATCH', message: `字段不匹配: ${message}` },
      };
    }

    return {
      ok: false,
      error: { code: 'UNKNOWN_ERROR', message },
    };
  }
}
