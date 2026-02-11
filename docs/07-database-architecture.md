# 07 数据库方案（PostgreSQL + Drizzle）

## 选型
- 数据库：PostgreSQL 16
- ORM：drizzle-orm
- 迁移工具：drizzle-kit
- 驱动：pg

## 关键理由
- 时序数据聚合能力强（周/月趋势、触发器分析）
- JSONB 支持标签与触发器灵活结构
- 与 Next.js + TypeScript 集成轻量，SQL 可控

## 运行模式
- 生产：配置 `DATABASE_URL`，使用 PostgreSQL 持久化。
- 本地演示：未配置 `DATABASE_URL` 时自动回退 in-memory。

## 核心表
- `users`
- `mood_entries`
- `daily_reviews`
- `app_config`

## 索引策略
- `mood_entries(user_id)`
- `mood_entries(occurred_at)`
- `daily_reviews(user_id, date)` 唯一索引

## 运维建议
- 连接池（pgBouncer）
- 定时备份与 PITR
- 慢查询监控（按日期聚合与 JSON 查询）