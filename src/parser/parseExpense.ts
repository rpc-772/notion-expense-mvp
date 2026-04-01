import { ExpenseInput } from '../types/expense';
import { matchCategory } from '../config/categories';
import { PAYMENT_KEYWORDS, MOOD_KEYWORDS, NOTE_KEYWORDS } from '../config/keywords';

/**
 * 从一句话文本解析结构化账目
 */
export function parseExpense(text: string): ExpenseInput {
  let remaining = text.trim();

  // 1. 提取金额
  const amounts = extractAmounts(remaining);
  if (amounts.length === 0) {
    throw new ParseError('INVALID_INPUT', '无法识别金额，请输入包含数字的记账文本');
  }
  if (amounts.length > 1) {
    throw new ParseError('INVALID_INPUT', '检测到多个金额，MVP 暂不支持，请只写一个金额');
  }
  const amount = amounts[0].value;
  if (amount <= 0) {
    throw new ParseError('INVALID_INPUT', '金额必须大于 0');
  }
  // 从文本中移除金额
  remaining = remaining.replace(amounts[0].match, '').trim();

  // 2. 提取日期
  const { date, rest: afterDate } = extractDate(remaining);
  remaining = afterDate;

  // 3. 提取心情
  const { keyword: mood, rest: afterMood } = extractKeyword(remaining, MOOD_KEYWORDS);
  remaining = afterMood;

  // 4. 提取备注说明
  const { keyword: noteExtra, rest: afterNote } = extractKeyword(remaining, NOTE_KEYWORDS);
  remaining = afterNote;

  // 5. 提取支付方式
  const { keyword: payment, rest: afterPayment } = extractKeyword(remaining, PAYMENT_KEYWORDS);
  remaining = afterPayment;

  // 组合 note: 支付方式 + 额外备注
  const noteParts = [payment, noteExtra].filter(Boolean);
  const note = noteParts.length > 0 ? noteParts.join(' ') : null;

  // 6. 剩余文本作为项目名称
  const itemName = remaining.replace(/\s+/g, '').trim();
  if (!itemName) {
    throw new ParseError('INVALID_INPUT', '无法识别项目名称，请补充消费项目');
  }

  // 7. 按关键词匹配类别
  const category = matchCategory(itemName);

  return {
    item_name: itemName,
    amount,
    date,
    category,
    mood: mood || null,
    note,
  };
}

// --- 内部工具函数 ---

interface AmountMatch {
  value: number;
  match: string;
}

function extractAmounts(text: string): AmountMatch[] {
  const regex = /(\d+(?:\.\d+)?)/g;
  const results: AmountMatch[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    // 排除日期中的数字（X月X日 格式）
    const before = text.slice(0, m.index);
    const after = text.slice(m.index + m[0].length);
    if (/\d*月$/.test(before) || /^日/.test(after) || /^月/.test(after)) {
      continue;
    }
    results.push({ value: parseFloat(m[0]), match: m[0] });
  }
  return results;
}

function extractDate(text: string): { date: string; rest: string } {
  const today = new Date();

  // YYYY-MM-DD
  const isoMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) {
    return { date: isoMatch[1], rest: text.replace(isoMatch[0], '').trim() };
  }

  // X月X日
  const cnDateMatch = text.match(/(\d{1,2})月(\d{1,2})日/);
  if (cnDateMatch) {
    const month = cnDateMatch[1].padStart(2, '0');
    const day = cnDateMatch[2].padStart(2, '0');
    const year = today.getFullYear();
    return {
      date: `${year}-${month}-${day}`,
      rest: text.replace(cnDateMatch[0], '').trim(),
    };
  }

  // 今天 / 昨天 / 前天
  if (text.includes('昨天')) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return { date: formatDate(yesterday), rest: text.replace('昨天', '').trim() };
  }
  if (text.includes('前天')) {
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);
    return { date: formatDate(dayBefore), rest: text.replace('前天', '').trim() };
  }
  if (text.includes('今天')) {
    return { date: formatDate(today), rest: text.replace('今天', '').trim() };
  }

  // 默认当天
  return { date: formatDate(today), rest: text };
}

function extractKeyword(
  text: string,
  keywords: string[]
): { keyword: string | null; rest: string } {
  for (const kw of keywords) {
    if (text.includes(kw)) {
      return { keyword: kw, rest: text.replace(kw, '').trim() };
    }
  }
  return { keyword: null, rest: text };
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export class ParseError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ParseError';
  }
}
