/**
 * 支付方式关键词 — 匹配后放入 note
 */
export const PAYMENT_KEYWORDS = [
  '微信', '支付宝', '现金', '信用卡', '花呗', 'Apple Pay',
];

/**
 * 心情关键词 — 只有明确表达时才写入 mood
 */
export const MOOD_KEYWORDS = [
  '很满意', '满意', '开心', '高兴',
  '有点遗憾', '遗憾',
  '后悔', '心疼', '肉疼',
  '划算', '值',
];

/**
 * 备注补充说明关键词 — 匹配后放入 note
 */
export const NOTE_KEYWORDS = [
  '生日用', '便利店买的', '网上买的', '朋友请客', '公司报销',
];
