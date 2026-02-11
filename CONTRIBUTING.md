# Contributing

感谢你参与 Emotion Journey！

## 开发环境

- Node.js 20+
- pnpm 10+
- PostgreSQL 16（可选；不配置 `DATABASE_URL` 也可用内存模式开发）

## 快速开始

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## 提交前检查

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @emotion-journey/web build
```

## 分支与提交建议

- 分支命名：`feat/...`、`fix/...`、`chore/...`
- Commit 建议使用 Conventional Commits：
  - `feat: ...`
  - `fix: ...`
  - `docs: ...`
  - `refactor: ...`
  - `test: ...`

## PR 要求

- 描述清楚“改了什么 + 为什么改”
- 如果涉及 UI，请附截图/录屏
- 如果涉及数据结构，请附迁移说明
- 确认本地检查通过

## 代码约定

- TypeScript 严格模式
- 优先保持小函数、可测试、可读性
- 非必要不引入重依赖
- 保持现有目录结构与命名风格一致