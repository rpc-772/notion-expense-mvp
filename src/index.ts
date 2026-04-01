import { validateEnv } from './config/env';
import { parseExpense, ParseError } from './parser/parseExpense';
import { addExpenseRecord } from './tools/addExpenseRecord';

async function main() {
  const input = process.argv.slice(2).join(' ').trim();

  if (!input) {
    console.error('用法: npx ts-node src/index.ts "午饭32微信"');
    process.exit(1);
  }

  validateEnv();

  // 解析
  let expense;
  try {
    expense = parseExpense(input);
  } catch (err) {
    if (err instanceof ParseError) {
      console.error(`解析失败: ${err.message}`);
    } else {
      console.error('未知解析错误:', err);
    }
    process.exit(1);
  }

  console.log('解析结果:', JSON.stringify(expense, null, 2));

  // 写入 Notion
  const result = await addExpenseRecord(expense);

  if (result.ok) {
    console.log(`写入成功! Notion Page ID: ${result.notion_page_id}`);
  } else {
    console.error(`写入失败: [${result.error.code}] ${result.error.message}`);
    process.exit(1);
  }
}

main();
