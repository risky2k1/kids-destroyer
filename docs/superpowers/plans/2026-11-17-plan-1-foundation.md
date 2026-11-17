# Plan 1: Nền móng (cấu trúc, theme, DB + RLS, đăng nhập, admin, chế độ trẻ)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng xong khung app. Admin đăng nhập được, quản lý được danh mục (môn, lớp, chủ đề) và gia đình (phụ huynh, trẻ). Phụ huynh đăng nhập được và bật được chế độ trẻ (avatar + PIN). Toàn bộ chạy trên schema đầy đủ có RLS.

**Architecture:** Một app Next.js 16 trong `src/`, chia các tầng `app / core / packages / plugins / themes`, ranh giới giữ bằng ESLint. Dữ liệu ở Supabase Postgres, RLS theo `family_id`. Đọc dữ liệu trong server component, ghi bằng server action. Trẻ không có tài khoản auth: chế độ trẻ chạy dưới phiên của phụ huynh, kèm cookie ký HMAC.

**Tech Stack:** Next.js 16.2 · React 19.2 · Tailwind 4 · shadcn CLI + neobrutalism.dev · `@supabase/supabase-js` + `@supabase/ssr` · `supabase` CLI (devDep, Supabase local chạy bằng Docker) · zod · Vitest · Prettier · Husky + lint-staged.

**Spec:** `docs/superpowers/specs/2026-11-17-kids-destroyer-design.md`

**Lộ trình các plan sau** (mỗi plan sẽ viết khi plan trước xong):
- Plan 2: hợp đồng plugin + registry + plugin `mcq`, `fill`, `number` + ngân hàng câu hỏi + soạn đề + admin bật/tắt plugin.
- Plan 3: giao bài, trẻ làm bài, chấm tự động, làm lại, hiện đáp án, phụ huynh chấm tay và nhận xét.
- Plan 4: plugin `order`, `match`, `writing`, `voice` + nút 🔊 đọc đề.
- Plan 5 (giai đoạn 2): plugin `ai-assist` (OpenRouter).

## Global Constraints

- **Đọc `node_modules/next/dist/docs/` trước khi viết code Next.** Next 16 dùng `proxy.ts`, không phải `middleware.ts` (`01-app/01-getting-started/16-proxy.md`). `cookies()` là async.
- Code nằm trong `src/`. Alias `@/*` → `./src/*`. Import tương đối chỉ dùng trong cùng một module.
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET`, `KID_SESSION_SECRET` chỉ dùng ở server. File dùng các biến này phải có `import 'server-only'`.
- RLS bật trên **mọi** bảng ở schema `public`.
- Không commit tên thật của gia đình hay trẻ. `/specs/` đã được gitignore. Seed chỉ chứa danh mục.
- Giao diện chỉ có tiếng Việt, viết thẳng chuỗi, không dùng i18n. `<html lang="vi">`.
- Màu và font chỉ khai báo qua token của theme. Không hard-code mã màu trong component.
- Không ghi vào Supabase thật (remote) cho đến Task 8, và chỉ khi chủ repo đồng ý.
- Mỗi task kết thúc với `npm run lint && npm run typecheck && npm test` đều xanh.

## Review Focus

1. Phụ huynh tự sửa `role` hoặc `family_id` trong `profiles` của mình để leo quyền → bị RLS chặn (test ở Task 3).
2. Trẻ đang ở chế độ trẻ gõ thẳng URL `/parent` hoặc `/admin` → bị đưa về `/kid` (test ở Task 7).
3. Cookie trẻ của nhà A dùng chung với phiên phụ huynh nhà B (đổi máy hoặc đổi tài khoản) → không nhận ra trẻ, quay về màn chọn (test ở Task 7).
4. Admin xóa môn, lớp hoặc chủ đề đang được dùng → báo lỗi dễ hiểu, không xóa dây chuyền dữ liệu (test ở Task 3 và Task 5).
5. Tạo phụ huynh bị trùng email, hoặc ghi profile thất bại → không để lại user auth mồ côi, có thông báo rõ (test ở Task 6).

---

### Task 1: Skill dự án, dời sang `src/`, tooling và luật ranh giới

**Files:**
- Create: `.claude/skills/fe-react-structure/SKILL.md` (bản Next.js). Delete: `fe-react-structure/`
- Move: `app/` → `src/app/`
- Modify: `tsconfig.json` (`paths: { "@/*": ["./src/*"] }`), `package.json`, `eslint.config.mjs`, `.gitignore` (thêm `/coverage`, giữ `/specs/`)
- Create: `vitest.config.ts`, `.prettierrc.json`, `.env.example`, `.nvmrc` (`24`), `src/core/routes.ts`, `src/core/routes.test.ts`

**Interfaces:**
- Produces: `PATHS` trong `@/core/routes`:
  `PATHS.login = '/login'`, `PATHS.admin.root = '/admin'`, `PATHS.admin.catalog = '/admin/catalog'`, `PATHS.admin.families = '/admin/families'`, `PATHS.admin.family(id: string) => '/admin/families/' + id`, `PATHS.parent.root = '/parent'`, `PATHS.parent.kidMode = '/parent/kid-mode'`, `PATHS.kid.root = '/kid'`, `PATHS.kid.exit = '/kid/exit'`.
- Produces: các script `dev, build, start, lint, lint:fix, typecheck (tsc --noEmit), test (vitest run), test:db (vitest run --config vitest.db.config.ts), format, format:check, prepare (husky)`.

- [ ] **Step 1: Viết skill bản Next.js.** Giữ nguyên tinh thần của `fe-react-structure/SKILL.md` (phân tầng, public `index.ts`, đặt tên, kích thước file, test cạnh code, các anti-pattern), thay các phần riêng của Vite theo mục 5 của spec: cây thư mục `src/{app,core,packages,plugins,themes}`, bảng phụ thuộc (bao gồm ngoại lệ `plugins/registry`), server component + server action thay cho `httpClient`, `NEXT_PUBLIC_*` thay cho `VITE_*`, không i18n, không Dockerfile (deploy Vercel). Frontmatter: `name: fe-react-structure`, description nói rõ là dành cho repo này (Next.js 16 + Supabase).
- [ ] **Step 2: Dời `app/` sang `src/app/`, sửa `tsconfig` paths, chạy `npm run build`.** Kết quả mong đợi: build OK.
- [ ] **Step 3: Cài devDeps:** `vitest`, `prettier`, `eslint-config-prettier`, `husky`, `lint-staged`, `supabase`; deps: `zod`, `server-only`. Tạo `vitest.config.ts` (alias `@` → `src`, `environment: 'node'`, `exclude` các file `*.db.test.ts`).
- [ ] **Step 4: Viết test thất bại `src/core/routes.test.ts`:** `expect(PATHS.admin.family('abc')).toBe('/admin/families/abc')` và `expect(PATHS.kid.root).toBe('/kid')`. Chạy `npm test`, mong đợi FAIL (module chưa tồn tại).
- [ ] **Step 5: Viết `src/core/routes.ts`, chạy `npm test`, mong đợi PASS.**
- [ ] **Step 6: Thêm luật ranh giới vào `eslint.config.mjs`** (`no-restricted-imports`, mỗi nhóm `files` một luật):
  - mọi `src/**`: cấm `../../*`.
  - `src/core/**`: cấm `@/app/*`, `@/packages/*`, `@/plugins/*`.
  - `src/themes/**`: cấm `@/app/*`, `@/core/*`, `@/packages/*`, `@/plugins/*`.
  - `src/packages/**`: cấm `@/app/*`, `@/packages/*/*` (import sâu), `@/plugins/*` trừ `@/plugins/registry`.
  - `src/plugins/**`: cấm `@/app/*`, `@/packages/*/*`.
  - Thêm `eslint-config-prettier` vào cuối config.
- [ ] **Step 7: Kiểm tra luật lint.** Tạo tạm `src/core/_probe.ts` có `import '@/packages/x'`, chạy `npx eslint src/core/_probe.ts`. Mong đợi: lỗi `no-restricted-imports`. Xóa file probe.
- [ ] **Step 8: Husky.** `npx husky init`. Pre-commit chạy `npx lint-staged` (eslint --fix + prettier cho các file staged). Pre-push chạy `npm run lint && npm run typecheck && npm test`.
- [ ] **Step 9: `.env.example`** liệt kê đủ tên biến (không ghi giá trị): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `KID_SESSION_SECRET`, `POSTGRES_URL_NON_POOLING`.
- [ ] **Step 10: `npm run lint && npm run typecheck && npm test && npm run build` đều xanh → commit** `chore: src layout, project skill, tooling, layer lint rules`.

### Task 2: Theme neobrutalism + layout gốc

**Files:**
- Create: `components.json` (shadcn), `src/themes/neobrutal/ui/*` (component do CLI sinh), `src/themes/neobrutal/lib/utils.ts` (`cn`)
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`

**Interfaces:**
- Produces: component UI import từ `@/themes/neobrutal/ui/<name>`: `button, card, input, label, select, table, dialog, badge, avatar, sonner`.

- [ ] **Step 1: Chạy `npx shadcn@latest init https://neobrutalism.dev/r/styling/<palette>.json`.** Chọn một palette tươi sáng trên trang styling; sau này đổi palette chỉ là thay token. Sửa `components.json`: `aliases.ui = "@/themes/neobrutal/ui"`, `aliases.utils = "@/themes/neobrutal/lib/utils"`, `aliases.components = "@/themes/neobrutal"`. CLI sẽ ghi token vào `src/app/globals.css`. Xóa các biến Geist cũ.
- [ ] **Step 2: Thêm component** bằng lệnh CLI lấy từ trang từng component trên neobrutalism.dev, cho danh sách ở Interfaces. Component nào không có CLI thì copy tay vào `src/themes/neobrutal/ui/`.
- [ ] **Step 3: Layout gốc.** Font `Lexend` từ `next/font/google` với `subsets: ['latin', 'vietnamese']`, gán vào token font của theme. `<html lang="vi">`. `metadata.title = 'Kids Destroyer'`. Gắn `<Toaster />` (sonner).
- [ ] **Step 4: `src/app/page.tsx`** chỉ redirect: chưa đăng nhập → `PATHS.login` (logic đầy đủ có ở Task 4; tạm thời redirect thẳng tới login). Tạm thời làm một trang `/login` tĩnh có Card, Input và Button để xem thử theme.
- [ ] **Step 5: Kiểm tra bằng mắt.** `npm run dev`, mở `/login`. Mong đợi: viền đen dày, bóng đổ cứng, chuỗi "Đăng nhập – Mật khẩu – Tiếng Việt có dấu ẫ ữ ộ" hiển thị đúng font Lexend (không rơi về font hệ thống). `npm run build` xanh.
- [ ] **Step 6: Commit** `feat(theme): neobrutalism tokens and base ui`.

### Task 3: Supabase local, schema đầy đủ, RLS và test RLS

**Files:**
- Create: `supabase/config.toml` (bằng `npx supabase init`), `supabase/migrations/20261117000000_init.sql`, `supabase/seed.sql`, `src/core/supabase/database.types.ts` (sinh tự động), `vitest.db.config.ts`, `src/test/db.ts`, `src/test/rls.db.test.ts`

**Interfaces:**
- Produces (SQL): các bảng ở mục 6 của spec, thêm: `questions.archived_at timestamptz`, `quizzes.archived_at timestamptz`, `unique(attempt_id, question_id)` trên `responses`, `unique(assignment_id, round)` trên `attempts`. Mọi FK tới `subjects/grades/topics/families/kids/questions/quizzes` dùng **`on delete restrict`**. `quiz_questions → quizzes` dùng `on delete cascade`. Enum: `app_role ('admin','parent')`, `assignment_status ('assigned','submitted','reviewed')`, `question_lang ('vi','en')`.
- Produces (SQL functions, `security definer`, `stable`, `set search_path = ''`): `public.is_admin() returns boolean`, `public.my_family_id() returns uuid`. Cả hai đọc `profiles` theo `auth.uid()`.
- Produces: `type Database` trong `@/core/supabase/database.types`.
- Produces (test helper `src/test/db.ts`): `adminClient()`, `signInAs(email: string, password: string): Promise<SupabaseClient<Database>>`, `seedTwoFamilies(): Promise<{ famA, famB, parentA, parentB, admin, kidA, kidB, subjectId, gradeId }>` (tạo user qua `auth.admin.createUser`, idempotent theo email).

- [ ] **Step 1: `npx supabase init`.** Trong `config.toml` đặt `[auth] enable_signup = false`. Chạy `npx supabase start`, mong đợi stack local chạy lên.
- [ ] **Step 2: Viết migration các bảng + enum + FK + index** (`questions(subject_id, grade_id)`, `assignments(kid_id)`, `kids(family_id)`).
- [ ] **Step 3: Viết RLS policies trong cùng migration:**
  - catalog (`subjects, grades, topics`), `plugins`, `settings`: `select` cho mọi `authenticated`; insert/update/delete chỉ khi `is_admin()`.
  - `families`: select khi `is_admin() or id = my_family_id()`; ghi chỉ admin.
  - `profiles`: select khi `is_admin() or id = auth.uid() or family_id = my_family_id()`; **insert/update/delete chỉ admin** (phụ huynh không tự sửa được role hay family).
  - `kids`: select/update khi `is_admin() or family_id = my_family_id()`; insert/delete chỉ admin.
  - `questions, quizzes`: select cho mọi `authenticated`; insert khi `created_by = auth.uid()`; update/delete khi `is_admin() or created_by = auth.uid()`.
  - `quiz_questions`: theo quyền của `quizzes` cha (dùng `exists`).
  - `assignments, attempts, responses`: mọi thao tác khi `is_admin()` hoặc trẻ liên quan (join tới `kids.family_id`) `= my_family_id()`.
- [ ] **Step 4: `supabase/seed.sql`:** subjects `Toán`, `Tiếng Anh`; grades `Mẫu giáo`(0), `Lớp 1`…`Lớp 5`(1–5). Chạy `npx supabase db reset`, mong đợi migration và seed áp dụng sạch.
- [ ] **Step 5: Sinh types** `npx supabase gen types typescript --local > src/core/supabase/database.types.ts`. Thêm script `db:types`.
- [ ] **Step 6: Viết `vitest.db.config.ts`** (include `**/*.db.test.ts`, đọc URL và key local bằng `npx supabase status -o env` qua globalSetup) và `src/test/db.ts`.
- [ ] **Step 7: Viết test RLS `src/test/rls.db.test.ts`**, mong đợi FAIL trước khi có policy (chạy với migration tạm chưa có phần policy để thấy fail, hoặc viết test trước Step 3):
  - `parentA` select `kids` → chỉ có `kidA`.
  - `parentA` insert kid với `family_id = famB` → lỗi.
  - `parentA` update `profiles set role='admin'` cho chính mình → 0 dòng bị đổi; đọc lại vẫn là `parent`.
  - `parentA` update `profiles set family_id = famB` → 0 dòng bị đổi.
  - `parentA` insert `subjects` → lỗi; select `subjects` → ≥ 2 dòng.
  - Câu hỏi do `parentB` tạo: `parentA` update → 0 dòng; `parentA` select → thấy.
  - Assignment của `kidB`: `parentA` select → rỗng.
  - `admin` select `kids` → có cả `kidA` và `kidB`.
  - Client anon select `questions` → rỗng.
  - `admin` delete grade đang được `kidA` dùng → lỗi FK (`23503`).
- [ ] **Step 8: `npm run test:db`, mong đợi PASS hết. Commit** `feat(db): schema, RLS, seed, rls tests`.

### Task 4: Supabase clients, proxy, phiên đăng nhập, đăng nhập/đăng xuất

**Files:**
- Create: `src/core/supabase/server.ts`, `src/core/supabase/browser.ts`, `src/core/supabase/admin.ts`, `src/proxy.ts`, `src/core/auth/session.ts`, `src/core/acl/access.ts`, `src/core/acl/access.test.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/login/actions.ts`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/parent/layout.tsx`, `src/app/parent/page.tsx`, `src/app/forbidden.tsx` hoặc trang 403 theo docs Next 16
- Create (dev): `.env.development.local` (gitignored) trỏ tới Supabase local, để `npm run dev` không đụng DB thật

**Interfaces:**
- Consumes: `Database` (Task 3), `PATHS` (Task 1).
- Produces:
  - `createClient(): Promise<SupabaseClient<Database>>` trong `@/core/supabase/server` (`@supabase/ssr` `createServerClient` + `await cookies()` với `getAll/setAll`).
  - `createBrowserClient()` trong `@/core/supabase/browser`.
  - `createAdminClient(): SupabaseClient<Database>` trong `@/core/supabase/admin` (có `import 'server-only'`, dùng service role).
  - `type Role = 'admin' | 'parent'`; `type CurrentUser = { id: string; email: string; role: Role; familyId: string | null; displayName: string }`.
  - `getCurrentUser(): Promise<CurrentUser | null>` và `requireRole(...roles: Role[]): Promise<CurrentUser>` trong `@/core/auth/session`. Chưa đăng nhập → redirect `PATHS.login`. Sai role → 403. Dùng `supabase.auth.getUser()`, **không** dùng `getSession()` để kiểm quyền.
  - `type Area = 'admin' | 'parent' | 'kid'`; `canEnter(area: Area, user: Pick<CurrentUser,'role'|'familyId'>): boolean` trong `@/core/acl/access`.

- [ ] **Step 1: Viết test thất bại `access.test.ts`:**
  - admin: `admin` → true, `parent` → true, `kid` → false.
  - parent có `familyId` → `admin` false, `parent` true, `kid` true.
  - parent không có `familyId` (null) → `kid` false.
- [ ] **Step 2: Viết `canEnter`, chạy test, mong đợi PASS.**
- [ ] **Step 3: Cài `@supabase/supabase-js @supabase/ssr`; viết 3 client.**
- [ ] **Step 4: `src/proxy.ts`:** refresh phiên Supabase theo hướng dẫn của `@supabase/ssr` cho Next (gọi `getUser()` trong proxy). Chưa có user mà vào `/admin`, `/parent`, `/kid` → redirect `/login`. (Luật cookie trẻ được thêm ở Task 7.) Matcher bỏ qua `_next/static`, `_next/image`, `favicon.ico` và file ảnh.
- [ ] **Step 5: `session.ts` + layout `admin` (`requireRole('admin')`) + layout `parent` (`requireRole('admin','parent')`).**
- [ ] **Step 6: Trang login + server action `signIn(formData)`** (zod: email, password tối thiểu 8 ký tự). Thành công → admin vào `/admin`, parent vào `/parent`. Sai → "Email hoặc mật khẩu không đúng" (không tiết lộ email có tồn tại hay không). Thêm action `signOut()`. `src/app/page.tsx`: đã đăng nhập → về trang theo role, chưa → `/login`.
- [ ] **Step 7: Kiểm tra thủ công** với user tạo bằng `seedTwoFamilies` trên local: admin vào `/admin`; parent vào `/admin` → 403; đăng xuất → về `/login`; chưa đăng nhập vào `/parent` → `/login`.
- [ ] **Step 8: lint/typecheck/test xanh → commit** `feat(auth): supabase clients, proxy, login, role guards`.

### Task 5: `packages/catalog`: admin quản lý môn, lớp, chủ đề

**Files:**
- Create: `src/packages/catalog/index.ts`, `src/packages/catalog/lib/schemas.ts`, `src/packages/catalog/lib/schemas.test.ts`, `src/packages/catalog/lib/errors.ts`, `src/packages/catalog/lib/errors.test.ts`, `src/packages/catalog/actions.ts`, `src/packages/catalog/queries.ts`, `src/packages/catalog/CatalogView.tsx`, `src/packages/catalog/components/*`, `src/app/admin/catalog/page.tsx`

**Interfaces:**
- Consumes: `createClient`, `requireRole` (Task 4).
- Produces (export qua `@/packages/catalog`):
  - `subjectInput`, `gradeInput` = zod `{ name: string(1..50, trim), sort: int ≥ 0 }`; `topicInput` = `{ name: string(1..80, trim), subjectId: uuid, gradeId: uuid }`.
  - `listCatalog(): Promise<{ subjects; grades; topics }>`.
  - Server actions: `saveSubject`, `deleteSubject`, `saveGrade`, `deleteGrade`, `saveTopic`, `deleteTopic`. Kiểu chung `(prev: ActionState, formData: FormData) => Promise<ActionState>`, với `type ActionState = { ok: boolean; error?: string }` (định nghĩa trong `@/core/actions.ts`, dùng lại ở mọi package).
  - `catalogErrorMessage(err: { code?: string }): string`: `'23503'` → `'Đang được dùng, không xóa được'`, `'23505'` → `'Tên đã tồn tại'`, còn lại → `'Có lỗi, thử lại'`.
  - Component `CatalogView` (server component).

- [ ] **Step 1: Viết test thất bại** cho schema (rỗng → lỗi; khoảng trắng 2 đầu bị trim; `sort` âm → lỗi) và `catalogErrorMessage` (3 trường hợp).
- [ ] **Step 2: Viết schema + errors, mong đợi PASS.**
- [ ] **Step 3: Viết queries, actions** (mỗi action bắt đầu bằng `requireRole('admin')`, sau đó `revalidatePath(PATHS.admin.catalog)`) và giao diện: 3 cột/tab Môn – Lớp – Chủ đề, có thêm/sửa/xóa, xóa phải xác nhận qua Dialog, lỗi hiện bằng toast.
- [ ] **Step 4: Kiểm tra thủ công:** thêm chủ đề "Cộng có nhớ" cho Toán/Lớp 2; xóa `Lớp 2` khi đang có chủ đề → toast "Đang được dùng, không xóa được".
- [ ] **Step 5: Commit** `feat(catalog): admin subjects/grades/topics`.

### Task 6: `packages/family`: gia đình, tài khoản phụ huynh, hồ sơ trẻ, PIN

**Files:**
- Create: `src/packages/family/index.ts`, `lib/pin.ts`, `lib/pin.test.ts`, `lib/schemas.ts`, `lib/schemas.test.ts`, `lib/avatars.ts`, `actions.ts`, `queries.ts`, `FamiliesView.tsx`, `FamilyDetailView.tsx`, `components/*`; `src/app/admin/families/page.tsx`, `src/app/admin/families/[id]/page.tsx`

**Interfaces:**
- Consumes: `createClient`, `createAdminClient`, `requireRole`, `ActionState`.
- Produces (export qua `@/packages/family`):
  - `hashPin(pin: string): Promise<string>`. Dùng `node:crypto` `scrypt`, salt ngẫu nhiên 16 byte, định dạng `scrypt$<saltB64>$<hashB64>`.
  - `verifyPin(pin: string, stored: string): Promise<boolean>`. Dùng `timingSafeEqual`. Chuỗi `stored` sai định dạng → `false`, không throw.
  - `pinSchema = z.string().regex(/^\d{4}$/)`.
  - `AVATARS: readonly string[]`: 12 emoji con vật (🐶 🐱 🐼 🦊 🐯 🦁 🐸 🐵 🐰 🐨 🐷 🐙). Avatar lưu dạng emoji, không cần storage.
  - Schema: `familyInput { name 1..50 }`, `parentInput { email, password ≥ 8, displayName 1..50, familyId uuid }`, `kidInput { displayName 1..30, avatar ∈ AVATARS, gradeId uuid, familyId uuid, pin: pinSchema }` (`pin` không bắt buộc khi sửa).
  - Actions (đều `requireRole('admin')`): `saveFamily`, `createParent`, `saveKid`, `resetKidPin`.
  - `listFamilies()`, `getFamily(id)` (trả kèm danh sách phụ huynh và trẻ, **không** trả `pin_hash`), `listKidsForFamily(familyId)` (dùng ở Task 7).

- [ ] **Step 1: Viết test thất bại `pin.test.ts`:** hash rồi verify đúng PIN → true; sai PIN → false; hash 2 lần cùng một PIN ra 2 chuỗi khác nhau; `verifyPin('1234', 'rác')` → false. Test schema: `pinSchema` từ chối `'123'`, `'12345'`, `'abcd'`; `kidInput` từ chối avatar ngoài danh sách.
- [ ] **Step 2: Viết `pin.ts` + schemas, mong đợi PASS.**
- [ ] **Step 3: `createParent`:** `auth.admin.createUser({ email, password, email_confirm: true })` → insert `profiles { id, role: 'parent', family_id, display_name }`. **Nếu insert profile lỗi thì `auth.admin.deleteUser(id)` rồi trả lỗi.** Email trùng → `'Email đã được dùng'`.
- [ ] **Step 4: Giao diện:** danh sách gia đình → trang chi tiết có 2 phần Phụ huynh (tạo tài khoản) và Trẻ (tạo/sửa: tên, avatar dạng lưới chọn emoji, lớp, PIN; nút "Đặt lại PIN").
- [ ] **Step 5: Kiểm tra thủ công trên local:** tạo 1 gia đình + 1 phụ huynh + 1 trẻ. Tạo phụ huynh lần 2 cùng email → báo lỗi, và trong `auth.users` không có user thừa (`select count(*) from auth.users where email=...` = 1).
- [ ] **Step 6: Commit** `feat(family): families, parent accounts, kid profiles with PIN`.

### Task 7: Chế độ trẻ (chọn avatar + PIN, cookie ký, khóa PIN, thoát bằng mật khẩu)

**Files:**
- Create: `src/core/auth/kidSession.ts`, `src/core/auth/kidSession.test.ts`, `src/core/auth/kidModeRedirect.ts`, `src/core/auth/kidModeRedirect.test.ts`, `src/packages/family/lib/lockout.ts`, `src/packages/family/lib/lockout.test.ts`, `src/packages/family/kidMode.ts` (server actions + `getCurrentKid`), `src/packages/family/KidPickerView.tsx`, `src/app/parent/kid-mode/page.tsx`, `src/app/kid/layout.tsx`, `src/app/kid/page.tsx` (tạm: "Chào {tên} {avatar}! Chưa có bài nào."), `src/app/kid/exit/page.tsx`, `src/test/kidMode.db.test.ts`
- Modify: `src/proxy.ts`, `src/app/parent/page.tsx` (thêm nút "Cho bé làm bài")

**Interfaces:**
- Consumes: `verifyPin`, `listKidsForFamily` (Task 6); `createClient`, `requireRole`, `getCurrentUser` (Task 4).
- Produces:
  - `KID_COOKIE = 'kd_kid'`; `KID_TTL_MS = 12 * 60 * 60 * 1000`.
  - `signKidToken(kidId: string, secret: string, now: number): string`. Định dạng `<kidId>.<expMs>.<hmacB64url>`, HMAC-SHA256 của `kidId.expMs`.
  - `verifyKidToken(token: string, secret: string, now: number): string | null`. Trả `kidId`, hoặc `null` khi sai chữ ký, hết hạn hoặc sai định dạng.
  - `kidModeRedirect(pathname: string, hasKidCookie: boolean): string | null`. Có cookie và path bắt đầu bằng `/parent` hoặc `/admin` → `'/kid'`; còn lại → `null`.
  - `PIN_MAX_FAILS = 5`, `PIN_LOCK_MS = 5 * 60 * 1000`.
  - `isLocked(lockedUntil: string | null, now: number): boolean`.
  - `afterFailedPin(failCount: number, now: number): { failCount: number; lockedUntil: string | null }`. Lần sai thứ 5 → `failCount: 0`, `lockedUntil = now + 5 phút`. Các lần trước đó → `failCount + 1`, `lockedUntil: null`.
  - `enterKidMode(prev: ActionState, formData: FormData /* kidId, pin */): Promise<ActionState>` (`requireRole('parent')`, admin không dùng).
  - `getCurrentKid(): Promise<{ id: string; displayName: string; avatar: string; gradeId: string; familyId: string } | null>`. Kiểm tra cookie, rồi **đọc kid bằng client của phiên phụ huynh** (RLS lọc theo nhà), không thấy → `null`.
  - `exitKidMode(prev: ActionState, formData: FormData /* password */): Promise<ActionState>`. Gọi `signInWithPassword` với email của user hiện tại. Đúng → xóa cookie, redirect `/parent`. Sai → `'Mật khẩu không đúng'`.

- [ ] **Step 1: Viết test thất bại `kidSession.test.ts`:** sign rồi verify → ra đúng `kidId`; đổi 1 ký tự chữ ký → `null`; `now > exp` → `null`; verify bằng secret khác → `null`; chuỗi `'abc'` → `null`.
- [ ] **Step 2: Viết test thất bại `lockout.test.ts`:** `afterFailedPin(0, t)` → `{1, null}`; `afterFailedPin(4, t)` → `{0, new Date(t+300000).toISOString()}`; `isLocked(new Date(t+1).toISOString(), t)` → true; `isLocked(null, t)` → false; `isLocked(quá khứ, t)` → false.
- [ ] **Step 3: Viết test thất bại `kidModeRedirect.test.ts`:** `('/parent', true)` → `'/kid'`; `('/admin/catalog', true)` → `'/kid'`; `('/kid', true)` → null; `('/parent', false)` → null; `('/parentx', true)` → null (chỉ khớp đúng đoạn path).
- [ ] **Step 4: Viết 3 module, mong đợi PASS.**
- [ ] **Step 5: `enterKidMode`:** đọc kid qua client phụ huynh (không thấy → `'Không tìm thấy bé'`) → `isLocked` → `'Sai nhiều lần, thử lại sau 5 phút'` → `verifyPin`. Sai → update `pin_failed_count`/`pin_locked_until` theo `afterFailedPin`, trả `'Sai PIN'`. Đúng → reset bộ đếm, set cookie (`httpOnly`, `sameSite: 'lax'`, `secure` khi production, `maxAge = KID_TTL_MS/1000`), redirect `/kid`.
- [ ] **Step 6: Sửa `proxy.ts`:** áp `kidModeRedirect` (chỉ kiểm tra cookie có tồn tại, đây là kiểm tra lạc quan; kiểm tra thật nằm ở `getCurrentKid`). `src/app/kid/layout.tsx`: `getCurrentKid()` ra null → xóa cookie, redirect `PATHS.parent.kidMode`.
- [ ] **Step 7: Giao diện:** `KidPickerView` hiện lưới avatar lớn (≥ 96px) của các trẻ trong nhà, chạm vào → bàn phím số 4 ô PIN (nút ≥ 64px). `/kid/exit`: ô mật khẩu phụ huynh.
- [ ] **Step 8: Test DB `kidMode.db.test.ts`:** dùng client của `parentB` đọc `kids` theo `id = kidA.id` → null (đây chính là truy vấn mà `getCurrentKid` dùng, nên cookie của nhà A đi với phiên nhà B sẽ không nhận ra trẻ).
- [ ] **Step 9: Kiểm tra thủ công trên điện thoại** (hoặc devtools mobile): vào chế độ trẻ, gõ `/parent` → bị đưa về `/kid`; sai PIN 5 lần → bị khóa; thoát bằng mật khẩu → về `/parent`.
- [ ] **Step 10: Commit** `feat(kid-mode): avatar+PIN entry, signed cookie, lockout, exit`.

### Task 8: Đưa lên Supabase thật và Vercel (cần chủ repo đồng ý)

**Files:**
- Create: `scripts/create-admin.mjs`. Tham số: `--email --password --name`. Dùng service role: tạo user auth + `profiles { role: 'admin', family_id: null }`, lỗi thì rollback như Task 6.
- Modify: `README.md` (cách chạy local, migrate, tạo admin, deploy)

- [ ] **Step 1: DỪNG LẠI, hỏi chủ repo** trước khi ghi vào DB thật. Sau khi được đồng ý: `npx supabase db push --db-url "$POSTGRES_URL_NON_POOLING"`. Mong đợi: migration được áp dụng, `seed.sql` **không** chạy. Danh mục cho remote do admin nhập qua giao diện, hoặc chủ repo đồng ý chạy seed riêng.
- [ ] **Step 2: Chủ repo tự làm trên dashboard Supabase:** tắt "Allow new users to sign up".
- [ ] **Step 3: Tạo admin trên remote** bằng `node scripts/create-admin.mjs ...`, chủ repo tự nhập email và mật khẩu.
- [ ] **Step 4: Vercel:** chủ repo thêm các biến trong `.env.example` (sinh `KID_SESSION_SECRET` bằng `openssl rand -base64 32`). Deploy, rồi chạy smoke test: đăng nhập admin, tạo danh mục và gia đình, đăng nhập phụ huynh, vào chế độ trẻ.
- [ ] **Step 5: Commit** `chore: admin bootstrap script, deploy docs`.
