export type ExpenseInput = {
  item_name: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category?: string | null;
  mood?: string | null;
  note?: string | null;
};

export type SuccessResult = {
  ok: true;
  record: {
    item_name: string;
    amount: number;
    date: string;
  };
  notion_page_id: string;
};

export type ErrorResult = {
  ok: false;
  error: {
    code:
      | 'INVALID_INPUT'
      | 'NOTION_AUTH_ERROR'
      | 'NOTION_API_ERROR'
      | 'DATABASE_SCHEMA_MISMATCH'
      | 'UNKNOWN_ERROR';
    message: string;
  };
};

export type AddExpenseResult = SuccessResult | ErrorResult;
