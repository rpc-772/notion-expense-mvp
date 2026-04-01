import { parseExpense, ParseError } from '../src/parser/parseExpense';

// 固定"今天"的日期用于测试
const TODAY = new Date();
const TODAY_STR = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}-${String(TODAY.getDate()).padStart(2, '0')}`;

describe('parseExpense', () => {
  // Case 1: 午饭32微信
  test('午饭32微信 -> 食品, note=微信', () => {
    const result = parseExpense('午饭32微信');
    expect(result.item_name).toBe('午饭');
    expect(result.amount).toBe(32);
    expect(result.date).toBe(TODAY_STR);
    expect(result.category).toBe('食品');
    expect(result.note).toBe('微信');
  });

  // Case 2: 打车18支付宝
  test('打车18支付宝 -> 交通工具, note=支付宝', () => {
    const result = parseExpense('打车18支付宝');
    expect(result.item_name).toBe('打车');
    expect(result.amount).toBe(18);
    expect(result.date).toBe(TODAY_STR);
    expect(result.category).toBe('交通工具');
    expect(result.note).toBe('支付宝');
  });

  // Case 3: 咖啡26
  test('咖啡26 -> 食品, no note', () => {
    const result = parseExpense('咖啡26');
    expect(result.item_name).toBe('咖啡');
    expect(result.amount).toBe(26);
    expect(result.date).toBe(TODAY_STR);
    expect(result.category).toBe('食品');
    expect(result.note).toBeNull();
  });

  // Case 4: 飞机30000 7月27日
  test('飞机30000 7月27日 -> 交通工具, date=当年-07-27', () => {
    const result = parseExpense('飞机30000 7月27日');
    expect(result.item_name).toBe('飞机');
    expect(result.amount).toBe(30000);
    expect(result.date).toBe(`${TODAY.getFullYear()}-07-27`);
    expect(result.category).toBe('交通工具');
    expect(result.note).toBeNull();
  });

  // Case 5: 32 (缺少项目名称)
  test('32 -> 应报错缺少项目名称', () => {
    expect(() => parseExpense('32')).toThrow(ParseError);
    expect(() => parseExpense('32')).toThrow('无法识别项目名称');
  });

  // 额外: 小数金额
  test('奶茶18.5 -> 食品', () => {
    const result = parseExpense('奶茶18.5');
    expect(result.amount).toBe(18.5);
    expect(result.item_name).toBe('奶茶');
    expect(result.category).toBe('食品');
  });

  // 额外: 无类别匹配
  test('理发50 -> category 为 null', () => {
    const result = parseExpense('理发50');
    expect(result.item_name).toBe('理发');
    expect(result.amount).toBe(50);
    expect(result.category).toBeNull();
  });

  // 额外: 心情识别
  test('午饭32很满意 -> mood=很满意', () => {
    const result = parseExpense('午饭32很满意');
    expect(result.mood).toBe('很满意');
    expect(result.item_name).toBe('午饭');
  });

  // 额外: 没有金额应报错
  test('午饭 -> 应报错无金额', () => {
    expect(() => parseExpense('午饭')).toThrow('无法识别金额');
  });

  // 额外: 昨天
  test('咖啡26昨天 -> date=昨天', () => {
    const yesterday = new Date(TODAY);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const result = parseExpense('咖啡26昨天');
    expect(result.date).toBe(yStr);
  });
});
