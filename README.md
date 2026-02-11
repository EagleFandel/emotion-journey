# Emotion Journey 路 鎯呯华鏃呯▼鍥?
> 杞昏褰?+ 寮哄彲瑙嗗寲 + 鍙瑙勫垯 AI 瑙ｈ鐨勬儏缁櫔浼翠骇鍝侊紙Web PWA 浼樺厛锛?
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-9FE870)](https://orm.drizzle.team/)

## 浜у搧瀹氫綅

Emotion Journey 甯姪鐢ㄦ埛浠ユ瀬浣庢垚鏈褰曟儏缁彉鍖栵紝骞惰嚜鍔ㄧ敓鎴愬彲瑙ｉ噴鐨勫鐩樹笌闀挎湡瓒嬪娍娲炲療銆?
- **杞昏褰?*锛氱偣涓€涓?+ 鎷変竴涓?+ 涓€鍙ヨ瘽锛?5 绉掑畬鎴愶級
- **寮哄彲瑙嗗寲**锛氬綋鏃ユ儏缁洸绾裤€佸懆/鏈堣秼鍔裤€佽Е鍙戝櫒娲炲療
- **瑙勫垯鍨?AI**锛氭尝宄?娉㈣胺璇嗗埆銆佹儏缁爣绛俱€佹俯鍜屽鐩樺弽棣?
## 鏍稿績鍔熻兘

- 鐧诲綍涓庝細璇濓紙閭鐧诲綍锛?- 鎯呯华鎵撶偣锛堟椂闂?0鈥?4銆佸垎鍊?-5~+5銆佸娉級
- 褰撴棩鏇茬嚎锛堝彲缂栬緫/鍒犻櫎锛?- 浠婃棩澶嶇洏锛堟尝宄般€佹尝璋枫€佹爣绛俱€佹€荤粨锛?- 闀挎湡娲炲療锛堝懆/鏈堣秼鍔?+ 楂橀瑙﹀彂鍣級
- 杞婚噺鍚庡彴锛堣瘝鍏搁厤缃€侀闄╄瘝閰嶇疆銆佹寚鏍囷級
- 闅愮鑳藉姏锛堝鍑烘暟鎹€佸垹闄よ处鍙凤級

## 鎶€鏈爤

- **鍓嶇**锛歂ext.js 16 (App Router), React 19, Tailwind CSS, Recharts
- **鍚庣**锛歂ext.js Route Handlers
- **鏁版嵁搴?*锛歅ostgreSQL 16 + Drizzle ORM + drizzle-kit + pg
- **娴嬭瘯**锛歏itest, Playwright
- **宸ョ▼鍖?*锛歱npm workspace, ESLint, TypeScript, GitHub Actions

## 椤圭洰缁撴瀯

```text
emotion-journey/
  apps/
    web/
      app/
      components/
      lib/
      drizzle/
  packages/
    domain/
    rule-engine/
    analytics/
    config/
    ui/
  docs/
```

## 蹇€熷紑濮?
### 1) 瀹夎渚濊禆

```bash
pnpm install
```

### 2) 閰嶇疆鐜鍙橀噺

```bash
cp .env.example .env.local
```

### 3) 鍒濆鍖栨暟鎹簱锛堝彲閫変絾鎺ㄨ崘锛?
```bash
pnpm db:generate
pnpm db:migrate
```

### 4) 鍚姩寮€鍙戠幆澧?
```bash
pnpm dev
```

璁块棶锛歚http://localhost:3000/landing`

---

## 鐜鍙橀噺

`.env.example`锛?
- `NEXT_PUBLIC_APP_URL`锛氬簲鐢ㄨ闂湴鍧€
- `DATABASE_URL`锛歅ostgreSQL 杩炴帴涓?- `ADMIN_USERS`锛氬悗鍙扮鐞嗗憳閭锛堥€楀彿鍒嗛殧锛?
> 杩愯绛栫暐锛?> - 閰嶇疆浜?`DATABASE_URL` 鈫?浣跨敤 PostgreSQL 鎸佷箙鍖?> - 鏈厤缃?`DATABASE_URL` 鈫?鑷姩鍥為€€鍐呭瓨瀛樺偍锛堜粎寮€鍙戞紨绀猴級

## 甯哥敤鍛戒护

```bash
pnpm dev            # 鍚姩寮€鍙?pnpm build          # 鍏ㄩ噺鏋勫缓
pnpm lint           # 浠ｇ爜妫€鏌?pnpm typecheck      # 绫诲瀷妫€鏌?pnpm test           # 鍗曞厓/闆嗘垚娴嬭瘯
pnpm test:e2e       # E2E 娴嬭瘯
pnpm db:generate    # 鐢熸垚杩佺Щ
pnpm db:migrate     # 鎵ц杩佺Щ
pnpm db:studio      # 鎵撳紑 Drizzle Studio
```

## API 姒傝

- `POST /api/mood-entries`
- `GET /api/mood-entries?date=YYYY-MM-DD`
- `PATCH /api/mood-entries/:id`
- `DELETE /api/mood-entries/:id`
- `GET /api/reviews/daily?date=...`
- `POST /api/reviews/daily/generate`
- `GET /api/insights/trends?range=week|month`
- `GET /api/insights/triggers?range=week|month`
- `GET /api/admin/metrics`
- `PUT /api/admin/lexicon`
- `PUT /api/admin/risk-terms`

## 璺嚎鍥?
- [x] Web PWA + 瑙勫垯鍨?AI 澶嶇洏
- [x] 鍛?鏈堣秼鍔?+ 瑙﹀彂鍣ㄥ垎鏋?- [x] 杞婚噺鍚庡彴 + 闅愮瀵煎嚭/鍒犻櫎
- [ ] 鍘熺敓 App 澹冲眰
- [ ] 涓€у寲鎻愰啋绛栫暐

## 澹版槑

鏈」鐩笉鎻愪緵鍖荤枟璇婃柇寤鸿锛屼笉鏇夸唬蹇冪悊鍜ㄨ鎴栫揣鎬ュ共棰勬湇鍔°€?
## License

寤鸿浣跨敤 MIT锛堝闇€鎴戝彲鐩存帴甯綘琛?`LICENSE` 鏂囦欢锛夈€
## Community & Governance

- Contribution guide: `CONTRIBUTING.md`
- Security policy: `SECURITY.md`
- Code of conduct: `CODE_OF_CONDUCT.md`
- Issue / PR templates: `.github/ISSUE_TEMPLATE/` and `.github/pull_request_template.md`

## Repository Setup

- Profile kit: `docs/repository-profile-kit.md`
- Launch checklist: `docs/repository-launch-checklist.md`