import type { VercelRequest, VercelResponse } from '@vercel/node';

const manifest = {
  identifier: 'notion-expense',
  api: [
    {
      url: 'https://notion-expense-mvp.vercel.app/api/add-expense',
      name: 'addExpense',
      description:
        '记录一笔支出到 Notion 数据库。接收一句话记账文本（如"午饭32微信"），自动解析项目名称、金额、日期、类别、备注，写入 Notion。',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description:
              '一句话记账文本，如：午饭32微信、打车18支付宝、咖啡26、飞机30000 7月27日',
          },
        },
        required: ['text'],
      },
    },
  ],
  meta: {
    avatar: '💰',
    title: 'Notion 记账助手',
    description: '一句话记账，自动解析并写入 Notion 数据库',
  },
  version: '1',
};

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(manifest);
}
