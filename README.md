# Echo · 腾讯视频广告 AI 改造 Demo

> **Ad is the echo of the story, not an interruption.**
> 广告是剧集的回声，不是打断。

腾讯 PCG 校园 AI 产品创意大赛参赛作品。
主张：**不是"把广告做得更好看"，而是重新定义广告与内容的边界。**

---

## 一、五分钟看懂 Echo

| # | 屏 | 核心创新 | 可交互点 |
|:-:|:---|:---|:---|
| 1 | `/` 场景选择 | 三剧集 + 入口地图 | 点任意剧集进入 |
| 2 | `/compare/[sceneId]` 核心对比 | 硬广 vs 原生广告**左右分屏** + AI 决策面板 | 同步播放、解锁叙事延展包 |
| 3 | `/mirror/[sceneId]` 情绪镜像 | **现场打字输入弹幕** → AI 实时生成变色广告 | 切换三套弹幕包 + 触发负向**熔断动画** |
| 4 | `/governance` 品味守门人 | 拖拽 8 品牌 × 3 剧集 → 实时契合度 + AI **自动修复**环 | 拖拽 / 一键修复 / 看矩阵 |
| 5 | `/value` 三方价值 | 动态 CPM 公式 + 冲突 Q&A + **战略性放弃**声明 | 拖动系数 / 看公式推导 |

---

## 二、本地运行

```bash
# 1. 安装依赖
npm install

# 2. 配置 LLM（可选，不配默认 Mock 模式，Demo 完整可跑）
cp .env.local.example .env.local
# 编辑 .env.local，填入 OPENAI_API_KEY / OPENAI_BASE_URL / OPENAI_MODEL

# 3. 跑起来
npm run dev
# 打开 http://localhost:3000
```

**LLM 服务商兼容清单**（认 OpenAI 接口不认厂商）：
DeepSeek / Kimi / 通义千问 / 智谱 / OpenAI / 任意 OpenAI-Compatible 自建代理。

详见 `.env.local.example`。

---

## 三、一键部署到 Vercel

1. Fork 或克隆本仓库到你自己的 GitHub
2. 到 [vercel.com/new](https://vercel.com/new) 导入仓库
3. **Framework Preset** 自动识别为 Next.js，无需改动
4. 在 **Environment Variables** 添加三个变量：
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL`（如 `https://api.deepseek.com/v1`）
   - `OPENAI_MODEL`（如 `deepseek-chat`）
5. **Deploy**。首次部署约 2 分钟。

> 不填环境变量也能部署，Demo 会自动进入 Mock 模式，评委仍可完整体验全部交互。
> Mock / Real 状态右上角实时显示。

---

## 四、技术架构（为什么这么选）

### 4.1 双模型架构（工程取舍）

```
实时 Demo 调用：DeepSeek-V3 / Kimi    ← 国内直连、<800ms、1/10 成本
离线 Prompt 精修：Claude 3.5 Sonnet  ← 文学腔调一次生成反复用
```

代码层对 LLM 完全无感：统一走 `src/lib/llm.ts` 的 OpenAI 客户端 + `src/lib/echo.ts` 的业务层路由。
换任何 OpenAI-Compatible 厂商只需改三个环境变量。

### 4.2 Hero 视频的"战略性放弃"

在 2026 年的节点上，**实时视频生成**在延迟（>60s）、成本（>¥5/条）、可控性（抽卡概率）三项上均未达商业化标准。

Echo 主动选择 **"实时决策 + 预合成素材库 + 动态图文旗舰版"** 架构：
- 1 段 hero 视频（硬止损 6 小时，不达标自动降级）
- 2 段**动态图文广告**（高质量 AI 生图 + 流式 LLM 文案 + 视差动画）

待 12-18 个月后视频生成实时化成熟，本架构可无缝迁移为全链路实时生成，**不需要重构**。

### 4.3 Mock 兜底层

`src/lib/mock.ts` 提供与真实 LLM **完全同构**的 mock 返回：文案、情绪聚合、契合度评分、AI 修复全部都有。
目的：**评委网络波动 / API 限流 / 服务商跑路 → Demo 永不黑屏**。

---

## 五、项目结构

```
src/
├── app/
│   ├── page.tsx               # 场景选择首屏
│   ├── compare/[sceneId]/     # 核心对比屏
│   ├── mirror/[sceneId]/      # 情绪镜像屏
│   ├── governance/            # 品味守门人
│   ├── value/                 # 三方价值屏
│   └── api/                   # LLM 调用路由（流式）
│       ├── tone/              # 腔调生成
│       ├── emotion/           # 弹幕情绪聚合
│       ├── fitness/           # 契合度评分
│       ├── repair/            # AI 广告修复
│       └── status/            # LLM 模式状态
├── components/                # TopNav / AdPlayer / CircuitBreaker / FitnessGauge / NarrativePackUnlock …
├── data/
│   ├── scenes.ts              # 3 剧集视觉 + 情绪曲线 + 叙事延展包脚本
│   ├── brands.ts              # 8 品牌素材（含内在契合度矩阵）
│   ├── danmaku.ts             # 3 组弹幕包（虐心/爽感/哲思/负向）
│   └── prompts.ts             # 范闲体 / 罗辑体 / 宝总体 Prompt 模板
└── lib/
    ├── llm.ts                 # OpenAI-Compatible 客户端
    ├── mock.ts                # 离线兜底
    └── echo.ts                # 统一业务层
```

---

## 六、完整说明文档

详见 [`docs/PROPOSAL.md`](./docs/PROPOSAL.md)，包含：

1. 核心问题：**沉浸契约被撕毁** —— 为什么长视频用户比短视频更讨厌广告？
2. Echo 方案全景：四大 AI 能力（原生广告生成 / 情绪镜像 / 品味守门人 / 叙事延展包）
3. 三方价值公式化：`Echo CPM = 曝光 × 基础单价 × 情绪契合系数 × 弹幕正向率 × 叙事延展溢价`
4. 冲突 Q&A：奢侈品 3 倍出价买《庆余年 2》硬广 —— 接不接？
5. 战略性放弃声明：哪些是 Echo 现在做的，哪些是留给技术成熟后做的
6. 最大风险与应对

---

## 七、致敬与声明

- 本项目所有"剧集"均使用**纯 CSS 风格化占位**（`SceneVideoStub`），不涉及真实视频内容
- "范闲 / 罗辑 / 宝总"仅用作**腔调引用**，不使用任何角色形象或剧集素材
- 品牌素材为**虚构示例**，不代表任何真实品牌立场
- Echo 是概念原型，**不构成任何平台或广告主的真实承诺**
