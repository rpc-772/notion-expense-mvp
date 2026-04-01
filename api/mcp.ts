import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseExpense, ParseError } from '../src/parser/parseExpense';
import { addExpenseRecord } from '../src/tools/addExpenseRecord';

/**
 * MCP Streamable HTTP endpoint
 * Implements JSON-RPC 2.0 for MCP protocol
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET: return server info / manifest for discovery
  if (req.method === 'GET') {
    res.json({
      name: 'notion-expense',
      version: '1.0.0',
      description: '一句话记账助手 - 自动解析并写入 Notion',
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body;

  // Handle JSON-RPC 2.0
  const { jsonrpc, id, method, params } = body;

  if (jsonrpc !== '2.0') {
    res.json({ jsonrpc: '2.0', id, error: { code: -32600, message: 'Invalid Request' } });
    return;
  }

  try {
    const result = await handleMethod(method, params);
    res.json({ jsonrpc: '2.0', id, result });
  } catch (err: any) {
    res.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: err.message || 'Internal error' },
    });
  }
}

async function handleMethod(method: string, params: any): Promise<any> {
  switch (method) {
    case 'initialize':
      return {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'notion-expense',
          version: '1.0.0',
        },
      };

    case 'notifications/initialized':
      return {};

    case 'tools/list':
      return {
        tools: [
          {
            name: 'addExpense',
            description:
              '记录一笔支出到 Notion 数据库。接收一句话中文记账文本，自动解析项目名称、金额、日期、类别、备注并写入。示例输入："午饭32微信"、"打车18支付宝"、"咖啡26"、"飞机30000 7月27日"',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: '一句话记账文本，如：午饭32微信',
                },
              },
              required: ['text'],
            },
          },
        ],
      };

    case 'tools/call':
      return await handleToolCall(params);

    default:
      throw { code: -32601, message: `Method not found: ${method}` };
  }
}

async function handleToolCall(params: any): Promise<any> {
  const { name, arguments: args } = params;

  if (name !== 'addExpense') {
    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  const text = args?.text;
  if (!text) {
    return {
      content: [{ type: 'text', text: '请提供记账文本' }],
      isError: true,
    };
  }

  // Parse
  let expense;
  try {
    expense = parseExpense(text);
  } catch (err) {
    if (err instanceof ParseError) {
      return {
        content: [{ type: 'text', text: `解析失败：${err.message}` }],
        isError: true,
      };
    }
    throw err;
  }

  // Write to Notion
  const result = await addExpenseRecord(expense);

  if (result.ok) {
    const parts = [`已记录：${result.record.item_name} ${result.record.amount}元`];
    if (expense.category) parts.push(`类别：${expense.category}`);
    if (expense.note) parts.push(`备注：${expense.note}`);
    parts.push(`日期：${result.record.date}`);

    return {
      content: [{ type: 'text', text: parts.join('\n') }],
    };
  } else {
    return {
      content: [{ type: 'text', text: `写入失败：${result.error.message}` }],
      isError: true,
    };
  }
}
