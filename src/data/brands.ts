/**
 * Echo · 品牌素材池
 * ============================================================
 * 治理仪表盘用：评委可拖拽以下品牌到三部剧集中，
 * 系统基于 (品类契合度 + 素材风格契合度) 给出实时评分。
 * ============================================================
 */

export type BrandMaterial = {
  id: string;
  name: string;
  category: string;
  /** 该素材的风格倾向：一组 tag，影响与剧集的契合度评分 */
  styleTags: string[];
  /** 素材原始文案（硬广文案） */
  rawCopy: string;
  /** 视觉表现：用于在卡片上显示的颜色 */
  color: string;
  /** emoji 作为简易 logo */
  glyph: string;
  /** 基础出价（相对值，用于演示"高价低契合"冲突场景） */
  basePrice: number;
};

export const BRANDS: BrandMaterial[] = [
  {
    id: 'xinghao',
    name: '星骁 X3 Pro',
    category: '3C 手机',
    styleTags: ['科技', '速度', '现代', '理性'],
    rawCopy: '星骁 X3 Pro，超快闪充，超长续航。充电 30 秒，畅享 10 小时。',
    color: '#5ce1ff',
    glyph: '📱',
    basePrice: 100,
  },
  {
    id: 'yucha',
    name: '玉茶屋',
    category: '快销食品',
    styleTags: ['休闲', '甜美', '年轻', '轻松'],
    rawCopy: '玉茶屋新品上市，水蜜桃乌龙，一口入夏。买一送一限时开启。',
    color: '#ff9fd5',
    glyph: '🧋',
    basePrice: 60,
  },
  {
    id: 'vermeer',
    name: 'Vermeer 维米尔',
    category: '奢侈品',
    styleTags: ['高贵', '欧式', '精致', '冷感'],
    rawCopy: 'Vermeer 2026 春夏系列，以光影为笔，定义不可复制的奢华。',
    color: '#b48f5e',
    glyph: '💎',
    basePrice: 240,
  },
  {
    id: 'sportcar',
    name: 'Thunderbolt GT',
    category: '汽车',
    styleTags: ['力量', '速度', '精密', '科技'],
    rawCopy: 'Thunderbolt GT 新能源旗舰，零百 2.8 秒，突破极限再定义驾驭。',
    color: '#ff6b35',
    glyph: '🚗',
    basePrice: 180,
  },
  {
    id: 'babygrow',
    name: 'BabyGrow 婴语',
    category: '母婴',
    styleTags: ['温柔', '安全', '家庭', '温暖'],
    rawCopy: 'BabyGrow 婴语，柔净奶瓶，每一滴都是母亲的心意。',
    color: '#ffd6a5',
    glyph: '🍼',
    basePrice: 70,
  },
  {
    id: 'neongame',
    name: 'Neon Saga · 霓境',
    category: '游戏',
    styleTags: ['冒险', '沉浸', '年轻', '热血'],
    rawCopy: '《霓境 Neon Saga》开服首周限定，登录即送传说级皮肤。',
    color: '#7c5cff',
    glyph: '🎮',
    basePrice: 90,
  },
  {
    id: 'wentour',
    name: '文旅·云栖',
    category: '文旅',
    styleTags: ['慢生活', '诗意', '文化', '复古'],
    rawCopy: '云栖古镇，三日两晚慢游，青石板上遇见另一个自己。',
    color: '#8fb389',
    glyph: '⛰️',
    basePrice: 80,
  },
  {
    id: 'eduplus',
    name: 'EduPlus 启思',
    category: '教育',
    styleTags: ['理性', '专业', '未来', '成长'],
    rawCopy: 'EduPlus 启思少儿编程，48 课打造孩子的逻辑底盘。',
    color: '#4ecdc4',
    glyph: '📚',
    basePrice: 75,
  },
  {
    id: 'glowup',
    name: 'GlowUp 露透',
    category: '美妆',
    styleTags: ['甜美', '精致', '潮流', '轻奢'],
    rawCopy: 'GlowUp 露透，鎏光精华水，七日见肌透光。',
    color: '#ff7ab6',
    glyph: '💄',
    basePrice: 85,
  },
  {
    id: 'finsure',
    name: '稳行保险',
    category: '金融保险',
    styleTags: ['稳健', '专业', '可靠', '理性'],
    rawCopy: '稳行综合医疗，百万保障，全家安心，一年低至 299 元。',
    color: '#6b8e9a',
    glyph: '🛡️',
    basePrice: 120,
  },
];

export function getBrand(id: string) {
  return BRANDS.find((b) => b.id === id);
}

/**
 * 异常场景：奢侈品 + 庆余年 3 倍出价（冲突场景 Q&A 用）
 */
export const CONFLICT_SCENARIO = {
  brandId: 'vermeer',
  sceneId: 'qingyunian',
  bidMultiplier: 3,
  description: 'Vermeer 坚持在《庆余年 2》高潮处插硬广，出价 3 倍',
};
