import express from 'express';
import { validateEnv } from './config/env';
import { parseExpense, ParseError } from './parser/parseExpense';
import { addExpenseRecord } from './tools/addExpenseRecord';

validateEnv();

const app = express();
app.use(express.json());

/**
 * POST /api/add-expense
 *
 * 接收两种格式：
 * 1. 一句话文本: { "text": "午饭32微信" }
 * 2. 已解析结构: { "item_name": "午饭", "amount": 32, ... }
 */
app.post('/api/add-expense', async (req, res) => {
  try {
    let expense;

    if (req.body.text) {
      // 一句话模式：由服务端解析
      try {
        expense = parseExpense(req.body.text);
      } catch (err) {
        if (err instanceof ParseError) {
          res.status(400).json({
            ok: false,
            error: { code: 'INVALID_INPUT', message: err.message },
          });
          return;
        }
        throw err;
      }
    } else if (req.body.item_name && req.body.amount) {
      // 已解析结构模式：直接使用
      expense = {
        item_name: req.body.item_name,
        amount: Number(req.body.amount),
        date: req.body.date || new Date().toISOString().slice(0, 10),
        category: req.body.category || null,
        mood: req.body.mood || null,
        note: req.body.note || null,
      };
    } else {
      res.status(400).json({
        ok: false,
        error: { code: 'INVALID_INPUT', message: '请提供 text 或 item_name + amount' },
      });
      return;
    }

    const result = await addExpenseRecord(expense);
    const status = result.ok ? 200 : 500;
    res.status(status).json(result);
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: { code: 'UNKNOWN_ERROR', message: err.message || String(err) },
    });
  }
});

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`记账 API 已启动: http://localhost:${PORT}`);
  console.log(`POST /api/add-expense  — 记一笔账`);
  console.log(`GET  /health           — 健康检查`);
});
