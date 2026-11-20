---
name: fe-react-structure
description: Quy ước cấu trúc thư mục và tổ chức code cho repo kids-destroyer (Next.js 16 App Router + Supabase + Tailwind 4, kiến trúc core/packages/plugins/themes kiểu Botble). Dùng khi thêm route, module, plugin, component, query/action, khi refactor thư mục, hoặc khi review xem code mới đặt đúng chỗ chưa.
---

# kids-destroyer — Cấu trúc và tổ chức code

Skill này là bản Next.js của chuẩn FE feature-based, áp dụng riêng cho repo này. Đọc kèm thiết kế ở `docs/superpowers/specs/2026-11-17-kids-destroyer-design.md`.

> Next.js 16 khác với kiến thức cũ: `proxy.ts` thay cho `middleware.ts`, `cookies()` là async. Đọc `node_modules/next/dist/docs/` trước khi dùng một API Next.

## 1. Cây thư mục

```
src/
├─ app/                  # CHỈ chứa route Next.js: page/layout/route/loading/error
│  ├─ (auth)/login/      # file mỏng: lấy dữ liệu, gọi View của package
│  ├─ admin/  parent/  kid/
│  ├─ layout.tsx  globals.css
├─ proxy.ts              # refresh phiên Supabase + redirect lạc quan
├─ core/                 # kernel, KHÔNG biết domain hay plugin cụ thể
│  ├─ supabase/          # server.ts, browser.ts, admin.ts (server-only), database.types.ts
│  ├─ auth/  acl/        # phiên, role, guard, phiên trẻ
│  ├─ modules/           # ModuleManifest, NAV_GROUPS, buildNav, activeKey
│  ├─ routes.ts          # PATHS: nguồn duy nhất cho mọi URL
│  └─ actions.ts         # ActionState dùng chung cho server action
├─ packages/             # hạ tầng DÙNG CHUNG cho mọi site (settings, sau này access, branding...)
│  ├─ registry.ts        # PACKAGES: ModuleManifest[]
│  └─ <module>/          # cấu trúc module chuẩn, áp dụng cả cho module trong plugin
│     ├─ manifest.ts     # khai báo nav (sau này: quyền, setting). Chỉ import PATHS + icon
│     ├─ index.ts        # public API: thứ duy nhất tầng khác được import
│     ├─ <Module>View.tsx    # màn hình gốc (server component)
│     ├─ actions.ts      # server action ('use server')
│     ├─ queries.ts      # đọc dữ liệu phía server
│     ├─ components/  hooks/
│     └─ lib/            # hàm thuần: schema zod, mapping, tính toán (+ test)
├─ plugins/              # plugin TÍNH NĂNG (nghiệp vụ của một sản phẩm)
│  ├─ registry.ts        # PLUGINS: ModuleManifest[] (thứ tự = thứ tự sidebar)
│  └─ kids-learning/     # plugin đầu tiên: app học tập cho trẻ
│     ├─ manifest.ts
│     ├─ assignment/ catalog/ dashboard/ family/ question-bank/ quiz/   # module chuẩn
│     └─ question-types/ # điểm mở rộng của question-bank: index.ts (types + registry),
│                        # server.ts (enabledMap), <type>/ = Editor/Player/Review + grade.ts
├─ themes/neobrutal/     # ui/ (shadcn neobrutalism), lib/utils.ts. Không chứa nghiệp vụ.
└─ test/                 # helper test dùng chung (db.ts, ...)
supabase/                # config.toml, migrations/*.sql, seed.sql
scripts/                 # script tooling (.mjs)
```

Không đặt ở gốc repo: tài liệu PoC, demo, dữ liệu cá nhân. `/specs/` đã gitignore để chứa dữ liệu gia đình, không được đọc dữ liệu đó vào code hay seed.

## 2. Quy tắc phụ thuộc (ESLint ép buộc)

```
app ──► core, themes, packages/*(index), packages/registry, plugins/registry, plugins/<p>/<module>(index)
plugins/<p>/<module> ──► core, themes, packages/*(index), plugins/<p>/<module khác>(index)
packages/<a> ──► core, themes, packages/<b>(index); KHÔNG import plugins
core ──► themes (chỉ khi thật cần); KHÔNG import packages/plugins/app
themes ──► chỉ thư viện ngoài
```

- Không import sâu vào file nội bộ (`@/packages/x/lib/y`, `@/plugins/p/x/lib/y`). Ngoại lệ duy nhất: entry server-only `@/plugins/<p>/<module>/server`. Nếu cần thì export qua `index.ts`, hoặc chuyển xuống `core/` nếu đó là hạ tầng.
- Hai module cùng cần một thứ hạ tầng → đưa thứ đó vào `core/`.
- Plugin không import plugin khác. Package không import plugin.
- Tính năng dùng lại được cho site khác → `packages/`. Nghiệp vụ riêng của một sản phẩm → module trong plugin. Không thêm kiến thức domain vào `core/`.
- Không có vòng phụ thuộc.
- Lưu ý `index.ts`: không gộp chung code `'use server'`, `server-only` và component client vào một barrel nếu làm hỏng bundle client. Khi cần, tách thêm entry `@/packages/x/client`.

## 3. Path alias

Luôn dùng `@/` (→ `src/`). Import tương đối chỉ dùng bên trong cùng một module hoặc plugin (`./components/X`, `../lib/y`). Cấm `../../`.

## 4. Dữ liệu: đọc, ghi, bảo mật

- **Đọc:** trong server component, dùng `createClient()` từ `@/core/supabase/server`, đặt trong `queries.ts` của module. Chỉ select những cột cần dùng.
- **Ghi:** dùng server action trong `actions.ts`. Mỗi action **bắt đầu bằng guard** (`requirePermission('<khu>.<hành động>')`, `requireUser()` hoặc `getCurrentKid()`), validate input bằng zod, trả về `ActionState` (`{ ok, error? }`), rồi `revalidatePath(PATHS...)`.
- **Quyền (RBAC):** vai trò là tập quyền, lưu ở `roles` và `role_permissions`. Mỗi module khai báo quyền trong `manifest.ts` (`permissions: [{ key, label }]`) và gắn `permission` cho từng link nav. Trong DB, policy dùng `has_permission('<khoá>')`. Thêm quyền mới thì phải: khai báo trong manifest, guard trong action và `layout.tsx` của màn, viết policy, rồi test trong `rbac.db.test.ts`. Quyền ('được làm gì') và `family_id` ('dữ liệu của ai') là hai trục riêng.
- **RLS là tuyến phòng thủ chính.** Mọi bảng đều bật RLS. Service role (`@/core/supabase/admin`) chỉ dùng cho thao tác admin cần thiết, ví dụ tạo user auth.
- Biến bí mật (`SUPABASE_SERVICE_ROLE_KEY`, `KID_SESSION_SECRET`, ...) chỉ dùng trong file có `import 'server-only'`. Biến công khai dùng tiền tố `NEXT_PUBLIC_`. Mọi biến đều phải có trong `.env.example`.
- Đáp án câu hỏi (`questions.answer`) không bao giờ được gửi xuống client của trẻ trước khi bài cho phép xem đáp án.
- Lỗi DB đổi thành thông báo tiếng Việt bằng hàm thuần trong `lib/` (theo mã lỗi Postgres như `23503`, `23505`). Component không so sánh chuỗi message.
- Migration SQL đặt trong `supabase/migrations/`. Sau khi đổi schema, chạy `pnpm db:types`.

## 5. Bên trong một module

- Ngưỡng tách: thư mục gốc của module có hơn khoảng 15 file thì chia vào `components/ hooks/ lib/`. Module lớn hơn khoảng 80 file thì tách thành nhiều module.
- Component dưới khoảng 300 dòng, tối đa khoảng 500. View lớn thì tách hook và component con.
- `View.tsx` chỉ điều phối: lấy dữ liệu, render component con. Logic thuần đặt trong `lib/` để test không cần render.
- Chia theo vai trò, không chia theo phiên bản (`v2/`, `poc*` bị cấm). Cần chạy song song bản cũ và mới thì dùng cờ trong bảng `settings`.

## 6. Plugin

- Plugin tính năng = thư mục trong `src/plugins/` có `manifest.ts`, đăng ký trong `src/plugins/registry.ts`. Sidebar admin được sinh từ `[...PLUGINS, ...PACKAGES]` (`src/app/_chrome/adminNav.ts`), không hard-code menu.
- **Quy ước cho plugin mới** (mẫu: `sword-x-staff`):
  - bảng DB có tiền tố riêng (`sxs_…`), RLS kèm `has_permission('<khoá>')`;
  - path do plugin sở hữu (`<plugin>/<lõi>/lib/paths.ts`), không đưa vào `core/routes.ts`;
  - `manifest.ts` import path theo đường dẫn tương đối để sidebar không kéo cả plugin vào bundle;
  - mỗi `layout.tsx` của plugin gọi `requireModule('<id>')` (từ `@/core/modules/server`) trước `requirePermission`;
  - dữ liệu nhỏ, gắn với một bản ghi thì lưu một document `jsonb` có zod schema, không tách thành nhiều bảng.
- Bật/tắt plugin ở `/admin/modules` (bảng `modules`, không có dòng nghĩa là đang bật). Plugin tắt thì mất khỏi menu và route trả 404; dữ liệu và quyền vẫn giữ nguyên. Package luôn bật.
- Dạng câu hỏi (trong `kids-learning/question-types/`) tuân theo `QuestionTypePlugin` của `@/plugins/kids-learning/question-types`: gồm `contentSchema`, `answerSchema`, `responseSchema`, `Editor`, `Player`, `Review`, `grade()`.
- `grade()` là hàm thuần, chỉ chạy ở server, bắt buộc có test.
- Đăng ký dạng câu hỏi trong `question-types/registry.ts`. Admin bật/tắt qua bảng `plugins`, plugin bị tắt vẫn render được dữ liệu cũ.

## 7. Routing, state, giao diện

- **Routing:** mọi URL đi qua `PATHS` trong `@/core/routes`, không hard-code chuỗi đường dẫn. Guard theo role đặt trong `layout.tsx` của nhánh route. `proxy.ts` chỉ làm kiểm tra lạc quan.
- **State:** state server lấy từ server component hoặc server action. State client chỉ dùng `useState` / `useActionState` trong component, khi thật cần dùng chung thì mới thêm store cho module đó. Không có store global.
- **Ngôn ngữ:** giao diện chỉ có tiếng Việt, viết thẳng chuỗi (không i18n). Nội dung tiếng Anh là dữ liệu.
- **Theme:** màu, font, bo góc, bóng đổ là token trong `globals.css` (do shadcn neobrutalism sinh). Component dùng class Tailwind map tới token (`bg-main`, `border-border`, `shadow-shadow`...), không hard-code mã màu.
- **Khu trẻ:** vùng bấm tối thiểu 44px (nút chính tối thiểu 64px), chữ lớn, ít chữ. Mọi tương tác kéo thả phải có cách thay thế bằng chạm.

## 8. Đặt tên

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component | `PascalCase.tsx` | `KidPicker.tsx` |
| Màn hình | `<Name>View.tsx` | `CatalogView.tsx` |
| Hook | `useXxx.ts` | `useRecorder.ts` |
| Hàm thuần | `camelCase.ts` | `lockout.ts` |
| Server action / query | `actions.ts` / `queries.ts` | |
| Thư mục | `kebab-case` | `question-bank/`, `question-mcq/` |
| Test | `<file>.test.ts`; test cần DB: `<file>.db.test.ts` | `pin.test.ts`, `rls.db.test.ts` |

## 9. Test

- Vitest, test đặt cạnh code. `pnpm test` chạy test thuần (không cần DB).
- `pnpm test:db` chạy `*.db.test.ts` trên Supabase local (`pnpm exec supabase start`, cần Docker). Mọi thay đổi RLS phải có test ở đây.
- Ưu tiên test `lib/`, `grade()` của plugin và RLS. Luồng giao diện kiểm tra thủ công trên điện thoại, tablet và laptop.

## 10. Tooling

- TS `strict`. ESLint (next + luật ranh giới) + Prettier.
- Husky: pre-commit chạy `lint-staged`; pre-push chạy `lint`, `typecheck`, `test`.
- Scripts: `dev`, `build`, `lint`, `lint:fix`, `typecheck`, `test`, `test:db`, `format`, `format:check`, `db:types`.
- Deploy lên Vercel. Áp migration lên Supabase thật chỉ khi chủ repo đồng ý.

## 11. Checklist khi thêm module mới

1. Chọn chỗ: dùng chung → `src/packages/<module>/`; nghiệp vụ → `src/plugins/<plugin>/<module>/`. Tạo `index.ts` và `<Module>View.tsx`. Có màn admin → thêm item nav vào `manifest.ts` của package/plugin.
2. Nếu cần bảng mới: viết migration có RLS, test trong `*.db.test.ts`, chạy `pnpm db:types`.
3. Thêm path vào `PATHS`, tạo route mỏng trong `src/app/...` dưới đúng layout có guard.
4. Server action: guard → zod → DB → `revalidatePath`.
5. Dùng component từ `@/themes/neobrutal/ui`, không hard-code màu.
6. Test cho `lib/`. `pnpm lint && pnpm typecheck && pnpm test` phải xanh.

## 12. Anti-pattern

| Tránh | Thay bằng |
|---|---|
| `core/` import `packages/` hay `plugins/` | Đưa kiểu/hợp đồng vào `core/`, phần hiện thực để ở tầng trên |
| `'../../../core/x'` | `@/core/x` |
| Import sâu vào module khác | Public `index.ts` |
| Kiểm quyền chỉ trong `proxy.ts` | Guard trong layout/action + RLS |
| Dùng service role cho thao tác thường | Client theo phiên + RLS |
| `getSession()` để kiểm quyền ở server | `getUser()` |
| Gửi `answer` xuống client của trẻ | Chỉ select `content` |
| Hard-code `'/admin/...'` | `PATHS` |
| So `roleId === '...'` để kiểm quyền | `can(user, '<khoá>')` / `requirePermission` |
| Tên thật của trẻ trong code hay seed | Admin nhập qua giao diện |
