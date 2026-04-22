# Echo · AI 上下文感知广告编排引擎

> **Ad is the echo of the story, not an interruption.**
> 广告是剧集的回声，不是打断。

腾讯 PCG 校园 AI 产品创意大赛参赛作品。
核心主张：**让广告借用剧集的情绪和语言，成为剧集的延续而非入侵。**

---

## 一、产品概述

Echo 做一件事：**AI 上下文感知广告编排**——在对的时间，投放对的品牌，用对的语言过渡。

三个环节串联成一条链路：

```
1. AI 预分析     → 平台拥有完整剧集，AI 提前分析场景/物体/情绪曲线，找到"情绪呼吸点"
      ↓
2. 品牌匹配      → 从动态广告库中，AI 选出与当前场景最契合的品牌（不是随机塞入）
      ↓
3. 过渡包装      → AI 生成"过渡语→广告→回归语"三段式，让广告融入剧情而非打断
```

### 三赢价值

| 角色 | 获益 |
|------|------|
| **用户** | 广告在情绪谷底自然出现，过渡语让切换不突兀，打扰更少 |
| **平台** | 用户不因广告流失，广告完播率提升，广告库价值释放 |
| **广告主** | 匹配品牌 + 剧集腔调包装 = 广告不被跳过，完播率和转化率双升 |

---

## 二、Demo 页面

| 页面 | 路由 | 核心功能 |
|------|------|----------|
| 首页 | `/` | 产品介绍 + 三功能入口 + IP 3D 画廊 |
| AI 预分析 | `/analyze` | 上传图片 → AI 视觉模型分析场景、物体、情绪曲线、推荐广告窗口 |
| 品牌匹配 | `/match` | 可视化 AI 从广告库选品过程：向量检索 → LLM 精排 → 选定最佳 |
| 对比演示 | `/compare` | 左右分屏：传统投放 vs Echo（过渡语+匹配品牌+回归语）|

当前聚焦 **庆余年 × 飞鹤卓睿** 场景做深度打磨。

---

## 三、本地运行

```bash
# 1. 安装依赖
npm install

# 2. 配置 LLM（可选，不配默认 Mock 模式，Demo 完整可跑）
cp .env.local.example .env.local
# 编辑 .env.local，填入四种模型变量：
#   OPENAI_API_KEY=你的key
#   OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
#   OPENAI_MODEL=glm-4.7-flash          # 文本模型
#   OPENAI_VISION_MODEL=glm-4v-flash     # 视觉模型
#   OPENAI_EMBEDDING_MODEL=embedding-3   # 向量模型
#   OPENAI_LONG_MODEL=glm-4-long         # 长上下文模型

# 3. 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

**命令速查：**

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run lint         # ESLint
npm run type-check   # TypeScript 类型检查
```

---

## 四、LLM 兼容 · 四模型架构

Echo 采用"认接口不认厂商"设计，支持任何 OpenAI-Compatible API。

| 模型角色 | 环境变量 | 用途 | 推荐（智谱） |
|----------|----------|------|-------------|
| 文本模型 | `OPENAI_MODEL` | 过渡语/回归语/情绪聚合/修复引擎 | `glm-4.7-flash`（免费） |
| 视觉模型 | `OPENAI_VISION_MODEL` | `/analyze` 多模态场景分析 | `glm-4v-flash`（免费） |
| 向量模型 | `OPENAI_EMBEDDING_MODEL` | 品牌-场景语义匹配 | `embedding-3` |
| 长上下文 | `OPENAI_LONG_MODEL` | 整集/多集离线分析（预留） | `glm-4-long` |

**支持厂商**：智谱 GLM / 百度千帆 / DeepSeek / Kimi / 通义千问 / OpenAI

**Mock 模式**：不填 API Key 自动启用，所有功能可正常演示。右上角显示状态 badge。

---

## 五、技术架构

```
src/
├── app/
│   ├── page.tsx                 # 首页（产品介绍）
│   ├── analyze/                 # AI 预分析页
│   ├── match/                   # 品牌匹配页
│   ├── compare/                 # 对比演示页
│   └── api/                     # API 路由
│       ├── tone/                # 流式腔调生成（支持 transition/return/ad-copy 三种模式）
│       ├── emotion/             # 弹幕情绪聚合
│       ├── fitness/             # 品牌契合度（向量召回 + LLM 重排）
│       ├── repair/              # AI 广告修复
│       ├── analyze/             # 场景分析（视觉模型 / Mock 双模式）
│       └── status/              # LLM 模式状态
├── components/                  # UI 组件
├── data/
│   ├── scenes.ts                # 庆余年场景（情绪曲线+资产+广告配置）
│   ├── brands.ts                # 10 品牌素材（含内在契合度矩阵）
│   ├── danmaku.ts               # 弹幕包（虐心/爽感/哲思/负向）
│   └── prompts.ts               # 范闲体 + 过渡语/回归语专用 Prompt
└── lib/
    ├── llm.ts                   # OpenAI-Compatible 客户端（四模型）
    ├── embedding.ts             # 向量检索（品牌-场景语义匹配）
    ├── mock.ts                  # 离线 Mock 兜底
    └── echo.ts                  # 统一业务层（UI 只调此层）
```

### 品牌匹配算法

```
最终评分 = 向量语义相似度 × 50% + 品类内在契合度 × 30% + LLM 精排评分 × 20%
```

1. **向量召回**：场景描述 + 品牌描述 → `embedding-3` → 余弦相似度
2. **品类映射**：预设的品类-剧集内在契合度矩阵
3. **LLM 重排**：`glm-4.7-flash` 对 top 候选做精排，输出评分 + 理由

**关键规则**：UI 组件不直接调 `llm.ts` 或 `mock.ts`，所有 AI 调用经 `echo.ts` 路由。

---

## 六、当前进度

### 已完成 ✅

- [x] 首页产品介绍 + 3D IP 画廊
- [x] AI 预分析页（上传图片 → 视觉模型分析 / 预设快速演示）
- [x] 品牌匹配页（向量检索 + LLM 重排 + 点击选中评分分解 + "为什么选它"面板）
- [x] 对比演示页 — 左屏：传统投放（高潮硬切护舒宝，品类不匹配）
- [x] 对比演示页 — 右屏：Echo 投放（过渡语 → 飞鹤广告 → 回归语）+ framer-motion 卡片动画
- [x] AI 决策面板（5步决策流程可视化 + 流式文案实时显示）
- [x] 过渡语/回归语专用 Prompt 模板（TRANSITION_PROMPT / RETURN_PROMPT）
- [x] 流式文案生成（过渡语 / 回归语 / 广告文案三种模式）
- [x] 四模型架构（文本 / 视觉 / 向量 / 长上下文）
- [x] 向量检索品牌匹配（embedding-3 + 余弦相似度 + LLM 重排）
- [x] 情绪曲线 SVG 入场动画 + hover tooltip + 广告推荐窗口标注
- [x] Mock 模式全功能兜底（无 Key 自动降级）
- [x] 暗色主题 + 液态玻璃设计体系
- [x] 移动端适配（响应式栅格 + 移动导航）
- [x] TypeScript 类型安全 + ESLint 通过 + 生产构建通过

### 待完成 🔧

- [ ] **Vercel 部署**：配置环境变量后一键部署
- [ ] **录制 3 分钟演示视频**
- [ ] **真实视频片段**：SceneVideoStub 目前是 CSS 合成占位，可替换为真实剧集预览片段
- [ ] **emotion/repair 前端接入**：对比页弹幕情绪面板 + 匹配页 AI 修复按钮

### 后续可扩展方向

1. **多场景支持**：当前仅庆余年，可扩展回三体、玫瑰的故事等
2. **实时弹幕反馈**：对比页加入实时弹幕输入，展示情绪响应
3. **广告效果仪表盘**：投放后的数据反馈面板
4. **A/B Test 模拟**：模拟同一批用户在传统/Echo 两种投放下的行为差异
5. **多轮对话优化**：品牌方可与 AI 对话调整过渡语风格

---

## 七、部署

### Vercel（推荐）

1. Fork 到你的 GitHub
2. [vercel.com/new](https://vercel.com/new) 导入仓库
3. Environment Variables 添加四个模型变量（见 `.env.local.example`）
4. Deploy

不填环境变量也能部署，自动进入 Mock 模式。

---

## 八、声明

- 剧集画面使用 CSS 风格化占位（`SceneVideoStub`），不涉及版权内容
- 真实广告视频（飞鹤/潘婷/护舒宝）仅用于演示对比效果
- "范闲"仅用作腔调引用，不使用角色形象
- 品牌契合度数据为模拟数据
- Echo 是概念原型，不构成任何商业承诺
