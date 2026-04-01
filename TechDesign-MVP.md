## 1. 文档目标

本设计文档用于指导 Claude 或其他代码代理直接实现“个人一句话记账 MVP”。

目标是：

- 接收用户的一句话记账文本，例如： `午饭32微信`、 `打车18支付宝`、 `咖啡26`
- 将自然语言解析为结构化账目
- 写入 Reed.Ren-任鹏成现有的 Notion 记账数据库
- **优先完成最小可用闭环**，避免第一版处理过多复杂逻辑

本版设计假设：

- 已存在可用的 Notion 数据库
- MVP 阶段不重建数据库
- MVP 阶段忽略 `主畫面` 字段
- 优先支持“支出”记账场景

---

## 2. MVP 范围

### 2.1 In Scope

- 接收一句话支出记账文本
- 解析出：项目名称、金额、日期、类别、心情、备注
- 将记录写入 Notion 数据库
- 对缺失关键字段的输入做一次最小追问或报错
- 默认日期为当天

### 2.2 Out of Scope

- 收入、报销、转账、多币种等复杂财务模型
- 自动创建 Notion 数据库字段
- 复杂 Relation 字段处理
- 历史账目去重
- 发票 OCR、截图识别
- 深度分类系统
- 账单统计与报表

---

## 3. 现有 Notion 数据库字段

根据当前截图，数据库名称约为： `鬆散的開支記錄 DB`。

已识别字段如下：

| 字段名  | 预估类型             | MVP 是否写入 | 说明           |
| :--- | :--------------- | :------- | :----------- |
| 项目名称 | Title            | 是        | 主标题列，必填      |
| 購買日期 | Date             | 是        | 必填，默认当天      |
| 金額   | Number/Currency  | 是        | 必填，正数        |
| 類別   | Select           | 否（建议写）   | 可选           |
| 心情   | Select           | 否        | 可选           |
| 備忘   | Rich text / Text | 否        | 可选           |
| 主畫面  | Relation 或页面引用   | 否        | **MVP 明确忽略** |

> 实现前必须再次核对字段名是否与 Notion 中完全一致。Notion API 的属性名区分实际字段文本，不能凭视觉近似猜测。

---

## 4. 功能需求

### 4.1 输入

输入为一条自然语言短文本，例如：

- `午饭32微信`
- `打车18支付宝`
- `咖啡26`
- `蛋糕500 生日`
- `飞机30000 7月27日`

### 4.2 输出

系统输出一条成功创建的 Notion 页面记录，或返回结构化错误信息。

### 4.3 最低必填字段

创建一条账目至少需要：

- 项目名称
- 金额
- 日期（若未提供则默认当天）

若金额或项目名称无法确定，系统应：

- 最多追问一次；或
- 直接返回明确错误，要求补全

---

## 5. 目标系统架构

推荐的最小实现链路如下：

```latex
用户消息
  -> OpenClaw / Claude
  -> 解析一句话账目
  -> 调用 add_expense_record 工具
  -> 服务端 Notion Client
  -> Notion Database
```

### 5.1 组件职责

#### A. LLM / Claude

负责：

- 从自然语言中抽取结构化字段
- 对缺失值进行最小判断
- 按工具 schema 组织参数

#### B. add\_expense\_record 工具

负责：

- 校验字段
- 补默认日期
- 将通用字段映射到 Notion 属性
- 调用 Notion API 创建页面
- 返回标准化结果

#### C. Notion Client

负责：

- 认证
- 调用 `pages.create`
- 处理 API 错误

---

## 6. 建议的数据模型

### 6.1 Claude 调用工具时的标准入参

```json
{
  "item_name": "午饭",
  "amount": 32,
  "date": "2026-04-01",
  "category": "食品",
  "mood": null,
  "note": "微信"
}
```

### 6.2 字段定义

| 字段         | 类型     | 必填   | 说明                |    |
| :--------- | :----- | :--- | :---------------- | -- |
| item\_name | string | 是    | 消费项目名称            |    |
| amount     | number | 是    | 支出金额，必须大于 0       |    |
| date       | string | 是    | `YYYY-MM-DD`，默认当天 |    |
| category   | string | null | 否                 | 类别 |
| mood       | string | null | 否                 | 心情 |
| note       | string | null | 否                 | 备注 |

---

## 7. Notion 字段映射

工具内部将通用入参映射为 Notion 属性：

| 工具字段       | Notion 字段 |
| :--------- | :-------- |
| item\_name | 项目名称      |
| amount     | 金額        |
| date       | 購買日期      |
| category   | 類別        |
| mood       | 心情        |
| note       | 備忘        |

### 7.1 Notion properties 示例

```json
{
  "parent": {
    "database_id": "YOUR_DATABASE_ID"
  },
  "properties": {
    "项目名称": {
      "title": [
        {
          "text": {
            "content": "午饭"
          }
        }
      ]
    },
    "購買日期": {
      "date": {
        "start": "2026-04-01"
      }
    },
    "金額": {
      "number": 32
    },
    "類別": {
      "select": {
        "name": "食品"
      }
    },
    "備忘": {
      "rich_text": [
        {
          "text": {
            "content": "微信"
          }
        }
      ]
    }
  }
}
```

### 7.2 空值策略

- 若 `category` 为空：不传 `類別`
- 若 `mood` 为空：不传 `心情`
- 若 `note` 为空：不传 `備忘`
- 不传 `主畫面`

---

## 8. 解析规则（MVP）

### 8.1 基本规则

1. 金额必须识别到
2. 项目名称必须识别到
3. 日期未提供时，默认使用当天
4. 备注可从支付方式或附加说明中提取
5. 类别可以根据关键词做弱映射
6. 心情只有在文本中明确表达时才写入

### 8.2 建议解析优先级

1. 提取金额
2. 提取日期
3. 剩余主体文本中确定项目名称
4. 从尾部或关键词中提取备注
5. 按词典映射类别
6. 尝试识别心情

### 8.3 金额规则

- 只支持正数支出
- 支持整数和小数
- 示例： `32`、 `18.5`、 `2990`
- 若出现多个金额，MVP 直接报错或追问，不自动猜测

### 8.4 日期规则

支持：

- 明确日期： `2026-04-01`
- 相对日期： `今天`、 `昨天`
- 简单月日： `7月27日`

若只有月日，默认补当前年份。

### 8.5 类别映射建议

可维护一个最小关键词词典：

```typescript
const CATEGORY_KEYWORDS = {
  食品: ['午饭', '晚饭', '早餐', '咖啡', '奶茶', '蛋糕', '零食', '餐', '吃饭'],
  交通工具: ['打车', '地铁', '高铁', '公交', '飞机', '机票'],
  小工具: ['耳机', '键盘', '鼠标', '电脑', '充电器', '数据线']
};
```

若映射不到，则不写类别。

### 8.6 备注提取建议

优先把以下内容放入备注：

- 支付方式：微信、支付宝、现金、信用卡
- 补充说明：例如“便利店买的”“生日用”

### 8.7 心情识别建议

只有明确表达时才写入，例如：

- `很满意`
- `有点遗憾`
- `后悔`

否则 `mood = null`。

---

## 9. 工具接口设计

### 9.1 Tool Name

`add_expense_record`

### 9.2 Tool Description

写入一条个人支出记录到 Notion 数据库。

### 9.3 Input Schema

```json
{
  "type": "object",
  "properties": {
    "item_name": {
      "type": "string",
      "description": "消费项目名称"
    },
    "amount": {
      "type": "number",
      "description": "支出金额，必须大于0"
    },
    "date": {
      "type": "string",
      "description": "消费日期，格式 YYYY-MM-DD"
    },
    "category": {
      "type": ["string", "null"],
      "description": "分类"
    },
    "mood": {
      "type": ["string", "null"],
      "description": "心情"
    },
    "note": {
      "type": ["string", "null"],
      "description": "备注"
    }
  },
  "required": ["item_name", "amount", "date"]
}
```

### 9.4 成功返回格式

```json
{
  "ok": true,
  "record": {
    "item_name": "午饭",
    "amount": 32,
    "date": "2026-04-01"
  },
  "notion_page_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 9.5 失败返回格式

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "amount is required"
  }
}
```

建议错误码：

- `INVALID_INPUT`
- `NOTION_AUTH_ERROR`
- `NOTION_API_ERROR`
- `DATABASE_SCHEMA_MISMATCH`
- `UNKNOWN_ERROR`

---

## 10. 服务端实现建议（TypeScript）

### 10.1 推荐技术栈

- Runtime: Node.js 20+
- Language: TypeScript
- Notion SDK: `@notionhq/client`
- Validation: `zod`（可选）

### 10.2 建议目录结构

```latex
src/
  config/
    env.ts
  notion/
    client.ts
    expenseDb.ts
  tools/
    addExpenseRecord.ts
  parser/
    parseExpense.ts
  utils/
    date.ts
    category.ts
  index.ts
```

### 10.3 环境变量

```plain
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxx
```

### 10.4 核心模块职责

#### `notion/client.ts`

- 初始化 Notion Client
- 导出单例

#### `notion/expenseDb.ts`

- 将通用结构转换为 Notion properties
- 调用 `notion.pages.create`

#### `tools/addExpenseRecord.ts`

- 校验传入参数
- 调用 `createExpensePage`
- 统一成功/失败响应

#### `parser/parseExpense.ts`

- 从一句话文本解析结构化账目
- 输出供 Claude 或工具使用的统一对象

---

## 11. 参考实现逻辑（伪代码）

```typescript
async function addExpenseRecord(input) {
  validate(input);

  const payload = buildNotionProperties({
    item_name: input.item_name,
    amount: input.amount,
    date: input.date,
    category: input.category,
    mood: input.mood,
    note: input.note,
  });

  const page = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_ID! },
    properties: payload,
  });

  return {
    ok: true,
    record: {
      item_name: input.item_name,
      amount: input.amount,
      date: input.date,
    },
    notion_page_id: page.id,
  };
}
```

---

## 12. 输入样例与期望解析

### Case 1

输入：

```latex
午饭32微信
```

期望：

```json
{
  "item_name": "午饭",
  "amount": 32,
  "date": "2026-04-01",
  "category": "食品",
  "mood": null,
  "note": "微信"
}
```

### Case 2

输入：

```latex
打车18支付宝
```

期望：

```json
{
  "item_name": "打车",
  "amount": 18,
  "date": "2026-04-01",
  "category": "交通工具",
  "mood": null,
  "note": "支付宝"
}
```

### Case 3

输入：

```latex
咖啡26
```

期望：

```json
{
  "item_name": "咖啡",
  "amount": 26,
  "date": "2026-04-01",
  "category": "食品",
  "mood": null,
  "note": null
}
```

### Case 4

输入：

```latex
飞机30000 7月27日
```

期望：

```json
{
  "item_name": "飞机",
  "amount": 30000,
  "date": "2026-07-27",
  "category": "交通工具",
  "mood": null,
  "note": null
}
```

### Case 5

输入：

```latex
32
```

期望：

- 失败，缺少项目名称
- 提示补充：“这笔支出是什么项目？”

---

## 13. 异常处理要求

### 13.1 输入错误

以下情况返回 `INVALID_INPUT`：

- 没有金额
- 没有项目名称
- 金额小于等于 0
- 日期格式非法

### 13.2 Notion 错误

以下情况需要显式区分：

- Token 无效
- Database ID 错误
- 字段名不匹配
- Select 选项不存在（取决于数据库设置）

### 13.3 建议降级策略

- `類別` 不存在或值非法：先不写该字段
- `心情` 不存在或值非法：先不写该字段
- `備忘` 写入失败：整体仍建议报错，不做半成功

---

## 14. Claude 编码提示建议

如果让 Claude 直接编码，建议明确这些要求：

1. 使用 TypeScript
2. 使用 `@notionhq/client`
3. 将字段名写成可配置常量，不要硬编码在多个文件
4. 所有可选字段在为空时不要传给 Notion
5. 输出完整、可运行的项目结构
6. 提供最小单元测试或示例调用
7. 不实现 `主畫面` 字段
8. 不实现收入、多币种、复杂财务逻辑

可直接给 Claude 的任务描述：

```latex
请根据 TechDesign-MVP.md 实现一个 TypeScript MVP：
- 解析一句话支出文本
- 调用 add_expense_record
- 把记录写入现有 Notion 数据库
- 忽略主畫面字段
- 必填字段：项目名称、購買日期、金額
- 可选字段：類別、心情、備忘
- 请输出完整项目代码、README、环境变量说明和最小测试样例
```

---

## 15. 验收标准

满足以下条件即视为 MVP 完成：

- 能处理至少 5 条一句话支出输入样例
- 能成功写入 Notion 数据库
- 未提供日期时自动补当天日期
- 可选字段为空时不影响写入
- `主畫面` 字段不参与任何写入逻辑
- 错误信息可读且可用于 Claude 重试

---

## 16. 已知风险与注意事项

1. **字段名风险**
   - 截图识别可能与真实字段名有细微差异
   - 开发前必须用 Notion API 或手工复制确认字段名

2. **Select 选项风险**
   - `類別`、 `心情` 若传入数据库中不存在的选项，可能失败
   - 建议先在数据库中预建常用选项，或在服务端仅允许白名单

3. **自然语言歧义风险**
   - 一句话文本可能缺少项目名称或含多个金额
   - MVP 不做复杂歧义消解，最多追问一次

4. **日期解释风险**
   - `昨天`、 `7月27日` 等相对/局部日期需要统一时区处理
   - 建议全部按用户常用时区解释

---

## 17. 下一步建议

实现顺序建议如下：

1. 先写 Notion 写库函数
2. 再写一句话解析器
3. 最后接到 OpenClaw / Claude 工具调用
4. 用真实数据库做 5\~10 条样例联调

如果需要进一步提高稳定性，第二阶段再补：

- 分类白名单
- 心情词典
- 一次追问逻辑
- 收入/报销支持
- 快捷指令或微信入口集成
