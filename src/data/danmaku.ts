/**
 * Echo · 弹幕数据集
 * ============================================================
 * 三组预设弹幕代表三种典型情绪主导场景；
 * 负向测试用例用于触发"情绪熔断"机制。
 * ============================================================
 */

export type DanmakuEmotion = 'heartache' | 'catharsis' | 'contemplation' | 'negative';

export type DanmakuMessage = {
  text: string;
  color?: string;
  weight?: number; // 权重：大权重=多次出现
};

export type DanmakuPack = {
  id: string;
  label: string;
  description: string;
  emotion: DanmakuEmotion;
  messages: DanmakuMessage[];
};

export const DANMAKU_PACKS: DanmakuPack[] = [
  {
    id: 'heartache',
    label: '虐心向',
    description: '情感谷底，观众共情角色的委屈与隐忍',
    emotion: 'heartache',
    messages: [
      { text: '心疼范闲💔' },
      { text: '这眼神太绝了' },
      { text: '看一次哭一次' },
      { text: '他不说，但全都写在脸上了' },
      { text: '范闲真的好难' },
      { text: '这场戏张若昀演得封神' },
      { text: '父亲那句话好扎心' },
      { text: '求求编剧放过他' },
      { text: '看得我破防了' },
      { text: '成年人的世界没有容易二字' },
      { text: '他明明只想好好活着' },
      { text: '为什么好人总要受委屈' },
      { text: '这一刻庆帝的分量比山还重' },
      { text: '范闲一个人扛了所有' },
      { text: '好想给他一个拥抱' },
      { text: '哭了哭了哭了' },
      { text: '这段剧情看了三遍' },
      { text: '温柔的人才是最硬的人' },
      { text: '心疼' },
      { text: '看不下去了' },
      { text: '他不哭但我已经哭了' },
      { text: '这才是真正的成长痛' },
      { text: '演技派的集体炸裂' },
      { text: '这一集封神' },
      { text: '范闲从不输，但也从不胜' },
      { text: '为什么偏偏是他' },
      { text: '懂了什么叫命运' },
      { text: '他咽下了所有' },
      { text: '这个世界配不上范闲' },
      { text: '一个眼神让我难受三天' },
    ],
  },

  {
    id: 'catharsis',
    label: '爽感向',
    description: '情绪高点，观众与角色共享逆袭的畅快',
    emotion: 'catharsis',
    messages: [
      { text: '爽！！！' },
      { text: '该！' },
      { text: '这波操作满分' },
      { text: '反杀漂亮' },
      { text: '终于翻盘了' },
      { text: '打脸现场' },
      { text: '太解气了' },
      { text: '等这一刻等太久' },
      { text: '笑死 这下真被爆杀了' },
      { text: '格局打开' },
      { text: '这一招简直封神' },
      { text: '反派终于挨铁拳' },
      { text: '爽文照进现实' },
      { text: '三集爆完积怨' },
      { text: '这才叫智商碾压' },
      { text: '范闲牛啊！' },
      { text: '看完舒服了' },
      { text: '真男人就该这么回击' },
      { text: '一个反杀值回年费' },
      { text: '编剧这波高端' },
      { text: '等这刀等了八集' },
      { text: '伏笔全收' },
      { text: '太燃了家人们' },
      { text: '过瘾' },
      { text: '舒坦' },
      { text: '这口气吐出来了' },
      { text: '男主 yyds' },
      { text: '打脸一气呵成' },
      { text: '整个人从头到脚的爽' },
      { text: '看完想原地起飞' },
    ],
  },

  {
    id: 'contemplation',
    label: '哲思向',
    description: '三体式冷峻思考，弹幕频率低但质量高',
    emotion: 'contemplation',
    messages: [
      { text: '黑暗森林的第一次震撼' },
      { text: '人类在宇宙里什么都不是' },
      { text: '想到罗辑就头皮发麻' },
      { text: '看完觉得地球真小' },
      { text: '这段台词值得背下来' },
      { text: '科幻第一次让我失眠' },
      { text: '三体文明的恐惧可以理解' },
      { text: '物理学不存在了' },
      { text: '四维展开的那一刻太震撼' },
      { text: '大史的烟 抽出了全人类的压力' },
      { text: '给岁月以文明' },
      { text: '不给文明以岁月' },
      { text: '谁能想到一本书改变三观' },
      { text: '光年 是最浪漫也最残忍的尺度' },
      { text: '这是东方的科幻' },
      { text: '看完之后看星星都不一样了' },
      { text: '罗辑的孤独太真' },
      { text: '人类从不缺浪漫 只缺勇气' },
      { text: '不该被翻译 应被重读' },
      { text: '一步两步三步走向深渊' },
      { text: '沉默不是答案 是坐标' },
      { text: '每一次仰望都是暴露' },
      { text: '看完想站阳台吹吹风' },
      { text: '冷 但冷得让人清醒' },
      { text: '这才是硬科幻应有的样子' },
    ],
  },

  {
    id: 'negative',
    label: '负向情绪（测试熔断）',
    description: '集中的厌恶/抱怨情绪，用于触发情绪熔断机制',
    emotion: 'negative',
    messages: [
      { text: '这剧真的烂透了' },
      { text: '演员演技是负分吧' },
      { text: '剧情强行拖' },
      { text: '又是狗血三角' },
      { text: '编剧脑子进水' },
      { text: '看不下去了 退订' },
      { text: '这价钱看这剧我亏了' },
      { text: '弃剧了 别劝' },
      { text: '流水线作品' },
      { text: '这滤镜看得我眼疼' },
      { text: '广告比剧精彩' },
      { text: '三倍速都嫌慢' },
      { text: '越看越烦' },
      { text: '服化道一塌糊涂' },
      { text: '演员像在背课文' },
      { text: '这季不如上季' },
      { text: '退钱' },
      { text: '真的看不下去' },
      { text: '导演能不能走心一点' },
      { text: '浪费我两小时' },
      { text: '烂俗剧情集合' },
      { text: '这就是 S 级制作？' },
      { text: '让我看到什么叫降智' },
      { text: '整季都是注水' },
      { text: '我图啥看这个' },
    ],
  },
];

/**
 * 根据 id 取弹幕包
 */
export function getDanmakuPack(id: string) {
  return DANMAKU_PACKS.find((p) => p.id === id);
}
