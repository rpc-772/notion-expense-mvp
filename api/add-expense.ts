import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseExpense, ParseError } from '../src/parser/parseExpense';
import { addExpenseRecord } from '../src/tools/addExpenseRecord';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } });
    return;
  }

  try {
    let expense;

    if (req.body.text) {
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
    res.status(result.ok ? 200 : 500).json(result);
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: { code: 'UNKNOWN_ERROR', message: err.message || String(err) },
    });
  }
}
