# AGENTS.md — Echo

Next.js 14 demo app (腾讯 PCG 校园 AI 创意大赛). No tests, no CI. Single developer workflow.

## Commands

```bash
npm run dev          # start dev server at http://localhost:3000
npm run build        # production build (verify before deploy)
npm run lint         # ESLint via next lint
npm run type-check   # tsc --noEmit (no build artifacts)
```

Run `type-check` and `lint` before claiming changes are correct — no automated test suite exists.

## Environment

Copy `.env.local.example` → `.env.local` and fill three vars:

```
OPENAI_API_KEY=
OPENAI_BASE_URL=   # e.g. https://api.deepseek.com/v1
OPENAI_MODEL=      # e.g. deepseek-chat
```

**Mock mode activates automatically** when `OPENAI_API_KEY` is absent or equals the placeholder `sk-your-key-here`. Set `ECHO_USE_MOCK=true` to force it. The UI shows a badge in the top-right corner.

## Architecture

```
src/
├── app/
│   ├── page.tsx               # Scene picker (home / entry point)
│   ├── compare/[sceneId]/     # Side-by-side hard ad vs native ad
│   ├── mirror/[sceneId]/      # Danmaku → real-time emotion → ad
│   ├── governance/            # Brand×Scene fitness drag-and-drop
│   ├── value/                 # CPM formula and value breakdown
│   └── api/                   # Next.js Route Handlers (server-side LLM calls)
│       ├── tone/              # Streaming copy generation
│       ├── emotion/           # Danmaku emotion aggregation
│       ├── fitness/           # Brand-scene fitness score
│       ├── repair/            # AI ad repair (streaming)
│       └── status/            # Returns current mock/real mode
├── components/                # Shared UI only — no business logic
├── data/
│   ├── scenes.ts              # 3 scene definitions (qingyunian / santi / fanhua)
│   ├── brands.ts              # 8 brand materials with intrinsic fitness matrix
│   ├── danmaku.ts             # 3 danmaku packs
│   └── prompts.ts             # Role tone system prompts + exemplars
└── lib/
    ├── llm.ts                 # OpenAI-compatible client + mockTextStream
    ├── mock.ts                # Full isomorphic mock for all LLM calls
    └── echo.ts                # Business logic layer — the ONLY thing UI calls
```

**Critical rule**: UI components never call `llm.ts` or `mock.ts` directly. All AI calls go through `src/lib/echo.ts`. API routes call `echo.ts` functions and stream the result back.

## LLM / Mock routing

- `src/lib/llm.ts` — raw OpenAI client; throws `'MOCK_MODE'` if no key
- `src/lib/mock.ts` — isomorphic mock returning pre-written copy, scores, and emotion data
- `src/lib/echo.ts` — routes between real and mock; UI pages and API routes import only from here

Streaming responses use `ReadableStream<Uint8Array>` returned directly as `Response` body in API routes. The `Content-Type` is `text/plain; charset=utf-8` with `Cache-Control: no-cache`.

## Scenes and data

Three hardcoded scene IDs: `qingyunian`, `santi`, `fanhua`. All scene config lives in `src/data/scenes.ts` (`SceneDefinition` type). Brand IDs and the `intrinsicFit` matrix are in `src/data/brands.ts`. When adding content, update `scenes.ts` or `brands.ts` — not scattered across components.

## Styling

- Tailwind CSS 3.4 with a custom dark-only palette (`background: #0c0c0e`)
- Single accent color: **amber / #d4a574** (aliases: `accent`, `echo`, `amber` — all identical)
- **Do not** add new accent colors; the design intentionally collapsed to one
- Fonts: `--font-heading` (Instrument Serif) for headings, `--font-body` (Barlow) for body
- Semantic color tokens: `surface`, `surfaceHi`, `border`, `text`, `muted`, `warn`, `danger`, `ok`
- Scene-specific tints: `qingyu` (#caa45d), `santi` (#7a8fa8), `fanhua` (#c07a7a)

## Path alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`). Always use `@/` imports, never relative `../../`.

## Deployment

- Vercel, region `hnd1` + `sin1`
- Streaming API routes have explicit `maxDuration`: tone/repair = 30s, emotion = 15s, fitness = 10s, status = 5s
- No changes to `vercel.json` needed unless adding new API routes

## Plan files

`*.plan.md` files in the root are BlueCode session plans (e.g. `ui_去塑料味重构_f9f2a0f8.plan.md`). They are working notes — do not delete; do not act on them unless instructed.
