# Repository Launch Checklist

## 1) GitHub 仓库创建

- Repository name: `emotion-journey`
- Description (CN): Emotion Journey：一个“轻记录 + 强可视化 + 规则型 AI 复盘”的情绪陪伴 Web PWA。
- Description (EN): A web-first emotion tracking PWA with lightweight input, strong visualization, and rule-based AI reflection.
- Visibility: Public（对外展示）/ Private（内部迭代）

## 2) 仓库 About 配置

建议 Topics：

`nextjs`, `typescript`, `postgresql`, `drizzle-orm`, `pwa`, `emotion-tracking`, `analytics`, `mental-wellbeing`

## 3) 必要文件确认

- [x] `README.md`
- [x] `LICENSE`
- [x] `CONTRIBUTING.md`
- [x] `SECURITY.md`
- [x] `CODE_OF_CONDUCT.md`
- [x] `.github/ISSUE_TEMPLATE/*`
- [x] `.github/pull_request_template.md`

## 4) 保护规则建议

- 保护 `main` 分支
- Require PR review
- Require status checks（lint/typecheck/test/build）

## 5) 首次发布建议

- 创建 `v0.1.0` Tag
- 发布 Release Notes（功能、已知限制、下一步计划）

## 6) GitHub CLI（可选）

```bash
# 在仓库根目录执行
# gh auth login
# gh repo create emotion-journey --public --source=. --remote=origin --push
```