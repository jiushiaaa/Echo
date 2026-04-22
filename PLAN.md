# Echo · 项目进度与后续计划

> 最后更新：2026-04-21 · 初赛截止：5.6

---

## 一、已完成的功能

### v5.2 — 模型升级 + 视频理解（4/20）

- 文本模型升级至 `glm-4.7-flashx`，视觉模型升级至 `glm-5v-turbo`
- `/analyze` 页面新增视频 URL 分析（GLM-5V-Turbo 原生视频理解）
- 后端新增 `llmVideoCall` + `analyzeVideoUrl`
- `.env.local.example` 更新为四模型全家桶配置

### v5.3 — 交互修复 + 本地视频分析（4/21）

**P0 严重问题修复：**

| 问题 | 文件 | 修复方式 |
|------|------|----------|
| 对比页重播竞态 | `CompareClient.tsx` | `runIdRef` + `timersRef` 统一清理 + fetch 流 runId 校验 |
| 自动播放 vs 手动点击双触发 | `CompareClient.tsx` | `hasAutoStarted` ref 阻止重复 + `clearAllTimers` |
| 品牌匹配页 API 失败卡死 | `MatchClient.tsx` | `try/catch` 包裹 + 单品牌 `.catch(fallback)` + 错误卡片 + 重试按钮 |
| 预分析情绪曲线不同步 | `AnalyzeClient.tsx` | `emotionCurve` 改为可写 state，API 返回时写入 |

**P1 体验优化：**

| 优化 | 文件 |
|------|------|
| `btn-primary:disabled` 禁用样式 | `globals.css` |
| 非图片文件拖入提示 | `AnalyzeClient.tsx` |
| 失败降级 `预设数据` chip + 快捷重试 | `AnalyzeClient.tsx` |
| 品牌卡片 cursor 按阶段切换 | `MatchClient.tsx` |
| 移动端步骤条简化显示 | `MatchClient.tsx` |
| LLM 徽章外部点击/Esc 关闭 | `LLMStatusBadge.tsx` |
| Logo hover 反馈 | `TopNav.tsx` |
| 左右屏切换时间标注浮层 | `CompareClient.tsx` |
| AI 决策面板流式区域虚线分隔 + 实时标注 | `AIDecisionPanel.tsx` |

**本地视频分析链路：**

| 链路 | 实现 |
|------|------|
| 上传区域 | 同时支持图片（JPG/PNG/WebP）和视频（MP4/WebM） |
| 视频分析策略 1 | 视频 base64 → `data:video/mp4;base64,...` data URI 直传 GLM-5V-Turbo |
| 视频分析策略 2 | 前端提取 8 帧关键帧 → `llmMultiFrameCall` 多图理解 |
| 视频分析策略 3 | 双链路均失败 → Mock 降级 |
| 视频 URL 分析 | 公网 URL → GLM-5V-Turbo 原生视频理解（保留） |
| 文件限制 | 20MB 上限，超过提示压缩或用 URL |

---

## 二、当前项目核心能力清单

| 能力 | 状态 | 备注 |
|------|:----:|------|
| AI 预分析（图片） | ✅ | GLM-5V-Turbo 视觉模型 |
| AI 预分析（本地视频） | ✅ | base64 直传 + 多关键帧双链路 |
| AI 预分析（视频 URL） | ✅ | GLM-5V-Turbo 原生视频理解 |
| AI 预分析（预设场景） | ✅ | Mock 模式，零配置可演示 |
| 品牌匹配（向量 + LLM 重排） | ✅ | embedding-3 + glm-4.7-flashx |
| 对比演示（过渡语/回归语流式生成） | ✅ | 左右分屏 + AI 决策面板 |
| 四模型架构 | ✅ | 文本/视觉/向量/长上下文 |
| Mock 全链路兜底 | ✅ | 无 Key 自动降级 |
| 暗色主题 UI | ✅ | 液态玻璃 + 噪点纹理 |
| 移动端适配 | ✅ | 响应式 + 移动导航 |
| 交互健壮性 | ✅ | 竞态/错误/降级全覆盖 |

---

## 三、明天（4/22）去公司要做的事

### 优先级 P0（必须完成）

#### 1. Vercel 部署 + 域名可访问

```bash
# 操作步骤
1. vercel.com/new → 导入 GitHub 仓库 jiushiaaa/Echo
2. Environment Variables 填入：
   OPENAI_API_KEY=你的智谱key
   OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
   OPENAI_MODEL=glm-4.7-flashx
   OPENAI_VISION_MODEL=glm-5v-turbo
   OPENAI_EMBEDDING_MODEL=embedding-3
   OPENAI_LONG_MODEL=glm-4-long
3. Deploy → 拿到 URL
4. 用自己手机 + 同事手机测一遍三个页面
```

**注意**：Vercel Serverless 有 10s 超时限制（免费版），视频分析可能超时。确认 `/api/analyze` 在 Vercel 上是否需要 Pro 版（maxDuration=120s）。如果超时，可以：
- 降低到 `maxDuration=60` 并只保留关键帧分析链路
- 或升级 Vercel Pro（$20/月）

#### 2. 真实视频片段替换

当前 `SceneVideoStub` 是 CSS 合成的占位画面，评委看到会减分。

```
操作：
1. 去腾讯视频找庆余年的公开预告片/宣传片（30s 内）
2. 用 FFmpeg 裁剪出两段：
   - 高潮段（范闲 vs 朝堂，10-15s）→ public/videos/scene-tight.mp4
   - 舒缓段（回府独白，10-15s）→ public/videos/scene-relaxed.mp4
3. 修改 SceneVideoStub 组件，当有真实视频时用 <video> 播放
4. 飞鹤/潘婷广告视频也找真实的（品牌官方 TVC 片段）
```

#### 3. 端到端走一遍真实 LLM 链路

部署后用真实 key 走一遍完整流程，确认：

| 检查项 | 页面 |
|--------|------|
| 上传一张庆余年截图，AI 返回场景分析 | `/analyze` |
| 上传一段 10s MP4，AI 返回视频分析 | `/analyze` |
| 粘贴一个公网视频 URL，分析正常 | `/analyze` |
| 点击预设，Mock 数据正常展示 | `/analyze` |
| 品牌匹配 5 个品牌全部返回评分 | `/match` |
| 对比演示过渡语/回归语流式生成 | `/compare` |
| Mock 模式（去掉 key）全部功能正常 | 全部 |

### 优先级 P1（尽量完成）

#### 4. 演示视频脚本 & 录制

总时长 3 分钟，5 幕：

| 时间 | 画面 | 要点 |
|------|------|------|
| 0:00-0:15 | 黑屏大字 | "你讨厌广告，不是因为它丑——是因为它在撕毁你的沉浸契约" |
| 0:15-0:45 | 对比演示页 | 左屏硬广砸下来 vs 右屏 Echo 自然过渡，过渡语流式生成 |
| 0:45-1:15 | AI 预分析页 | 上传图片/视频 → AI 实时分析场景+情绪曲线+推荐窗口 |
| 1:15-1:45 | 品牌匹配页 | 5 品牌评估动画 → AI 选中最佳 → 评分分解 |
| 1:45-2:15 | 对比演示重播 | 聚焦 AI 决策面板 5 步流程，回归语拉回剧情 |
| 2:15-2:45 | 三方价值总结 | 用户/平台/广告主各获什么，Echo CPM 公式 |
| 2:45-3:00 | 结束画面 | Echo logo + "广告是剧集的回声，不是打断" |

录制工具：OBS 或 LICEcap（GIF）或直接 QuickTime

#### 5. 说明文档撰写

比赛要求提交的文档，包含：
- 核心问题（用户为什么讨厌广告：沉浸契约 + 剥夺感）
- 方案设计（AI 做了什么，用户体验到了什么变化）
- 三方价值说明
- 技术诚实声明（战略性放弃实时视频生成）
- 风险与挑战

### 优先级 P2（锦上添花）

#### 6. 弹幕情绪面板接入

对比页加一个实时弹幕输入框，评委可以现场打字 → AI 分析情绪 → 影响广告投放决策。后端 `/api/emotion` 已就绪，只需前端接入。

#### 7. AI 修复引擎前端接入

品牌匹配页，低分品牌显示"AI 改造"按钮 → 点击 → 流式生成改造文案 → 分数提升。后端 `/api/repair` 已就绪。

#### 8. 多场景支持

扩展三体、玫瑰的故事场景数据，让评委可以切换不同剧集体验。

---

## 四、文件快速索引

| 要改的东西 | 改哪个文件 |
|-----------|-----------|
| 替换视频占位 | `src/components/SceneVideoStub.tsx` |
| 添加新剧集场景 | `src/data/scenes.ts` |
| 添加新品牌 | `src/data/brands.ts` |
| 调整过渡语/回归语 prompt | `src/data/prompts.ts` |
| 修改 LLM 调用逻辑 | `src/lib/echo.ts`（业务层）/ `src/lib/llm.ts`（底层） |
| 修改品牌匹配算法权重 | `src/lib/echo.ts` 的 `scoreFitness` 函数 |
| 调整 UI 主题/样式 | `src/app/globals.css` |
| Vercel 部署配置 | Vercel Dashboard → Environment Variables |

---

## 五、关键时间节点

| 日期 | 任务 | 状态 |
|------|------|:----:|
| 4/21 | 交互修复 + 本地视频分析 + 代码推送 | ✅ |
| 4/22 | Vercel 部署 + 真实视频替换 + LLM 端到端验证 | ⬜ |
| 4/23-24 | 录制演示视频 + 撰写说明文档 | ⬜ |
| 4/25-26 | 弹幕面板 + AI 修复引擎（P2） | ⬜ |
| 4/27-30 | 打磨细节 + 找人试看 + 缓冲期 | ⬜ |
| 5/1-5 | 最终检查 + 提交 | ⬜ |
| **5/6** | **初赛截止** | ⏰ |
