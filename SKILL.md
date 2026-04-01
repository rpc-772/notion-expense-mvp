---
name: notion-expense
description: >-
  One-line expense tracker that parses natural language Chinese expense text
  and writes structured records to a Notion database.
  Use when the user sends short expense messages like "午饭32微信" or "打车18支付宝".
metadata:
  author: rpc-772
  version: "1.0"
---

## Notion 一句话记账助手

当用户发送一句话记账文本时，调用记账 API 将记录写入 Notion 数据库。

### 支持的输入格式

- `午饭32微信` → 项目:午饭, 金额:32, 备注:微信
- `打车18支付宝` → 项目:打车, 金额:18, 备注:支付宝
- `咖啡26` → 项目:咖啡, 金额:26
- `飞机30000 7月27日` → 项目:飞机, 金额:30000, 日期:7月27日
- `蛋糕500 生日用` → 项目:蛋糕, 金额:500, 备注:生日用

### 调用方式

收到记账文本后，立即发送 HTTP POST 请求：

```
POST https://notion-expense-mvp.vercel.app/api/add-expense
Content-Type: application/json

{
  "text": "用户发送的原始文本"
}
```

### 成功响应

```json
{
  "ok": true,
  "record": { "item_name": "午饭", "amount": 32, "date": "2026-04-01" },
  "notion_page_id": "xxx"
}
```

收到成功响应后回复用户：
`已记录：[item_name] [amount]元`

### 失败响应

```json
{
  "ok": false,
  "error": { "code": "INVALID_INPUT", "message": "错误信息" }
}
```

收到失败响应后回复用户失败原因。

### 重要规则

- 不要追问确认，直接调用 API
- 不要自己解析文本，交给 API 处理
- 回复要简短
