/**
 * 类别关键词映射 — 按关键词匹配项目名称推断类别
 */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  食品: ['午饭', '晚饭', '早餐', '咖啡', '奶茶', '蛋糕', '零食', '餐', '吃饭', '外卖', '火锅', '烧烤'],
  交通工具: ['打车', '地铁', '高铁', '公交', '飞机', '机票', '出租车', '滴滴'],
  小工具: ['耳机', '键盘', '鼠标', '电脑', '充电器', '数据线', '手机壳'],
};

/**
 * 根据项目名称匹配类别，匹配不到返回 null
 */
export function matchCategory(itemName: string): string | null {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (itemName.includes(keyword)) {
        return category;
      }
    }
  }
  return null;
}
