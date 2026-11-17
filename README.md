# Kids Destroyer

App giao bài và luyện tập cho các cháu trong gia đình. Admin cấu hình danh mục và tài khoản, phụ huynh giao bài và chấm bài, trẻ làm bài trong chế độ trẻ (avatar + PIN).

- Thiết kế: [docs/superpowers/specs/](docs/superpowers/specs/)
- Kế hoạch triển khai: [docs/superpowers/plans/](docs/superpowers/plans/)
- Quy ước code (bắt buộc): [.claude/skills/fe-react-structure/SKILL.md](.claude/skills/fe-react-structure/SKILL.md)

Stack: Next.js 16 (App Router, `proxy.ts`), React 19, Tailwind 4 + neobrutalism (shadcn), Supabase (Auth, Postgres + RLS), Vitest. Deploy lên Vercel.

## Chạy ở máy (Supabase local, cần Docker)

```bash
nvm use                     # Node 24
npm install
npx supabase start          # chạy stack local
npx supabase db reset       # áp migration + seed danh mục
```

Tạo file `.env.development.local` (đã gitignore). `npm run dev` sẽ dùng file này thay cho `.env.local`, nên không đụng vào DB thật:

```bash
npx supabase status -o env  # lấy API_URL, PUBLISHABLE_KEY, SERVICE_ROLE_KEY
```

```
NEXT_PUBLIC_SUPABASE_URL=<API_URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<PUBLISHABLE_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
KID_SESSION_SECRET=<openssl rand -base64 32>
```

```bash
node --env-file=.env.development.local scripts/create-admin.mjs --email admin@local.test --password 'password123'
npm run dev
```

## Kiểm tra

| Lệnh                                 | Việc                                                              |
| ------------------------------------ | ----------------------------------------------------------------- |
| `npm run lint` / `npm run typecheck` | ESLint (gồm luật ranh giới giữa các tầng) / TypeScript            |
| `npm test`                           | Unit test (không cần DB)                                          |
| `npm run test:db`                    | Test RLS trên Supabase local                                      |
| `npm run db:types`                   | Sinh lại `src/core/supabase/database.types.ts` sau khi đổi schema |

## Đưa lên Supabase thật + Vercel

> Đây là thao tác ghi vào DB thật. Chỉ chạy khi đã chắc chắn.

1. Áp migration (không chạy seed): `npx supabase db push --db-url "$POSTGRES_URL_NON_POOLING"`
2. Trên dashboard Supabase: Authentication → tắt **Allow new users to sign up**.
3. Tạo admin: `node --env-file=.env.local scripts/create-admin.mjs --email <email> --password '<mật khẩu>' --name '<tên>'`
4. Trên Vercel: thêm các biến trong [.env.example](.env.example). `KID_SESSION_SECRET` sinh bằng `openssl rand -base64 32`. Sau đó deploy.
5. Đăng nhập admin, nhập danh mục (môn, lớp), gia đình, phụ huynh, các bé.

Dữ liệu thật của gia đình (tên các bé...) chỉ nhập qua giao diện admin. Không đưa vào code hay seed.
