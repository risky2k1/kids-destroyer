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
│  ├─ plugins/           # kiểu QuestionTypePlugin, đọc trạng thái bật/tắt
│  ├─ routes.ts          # PATHS: nguồn duy nhất cho mọi URL
│  └─ actions.ts         # ActionState dùng chung cho server action
├─ packages/             # module domain luôn bật (tương đương "features")
│  └─ <module>/
│     ├─ index.ts        # public API: thứ duy nhất tầng khác được import
│     ├─ <Module>View.tsx    # màn hình gốc (server component)
│     ├─ actions.ts      # server action ('use server')
│     ├─ queries.ts      # đọc dữ liệu phía server
│     ├─ components/  hooks/
│     └─ lib/            # hàm thuần: schema zod, mapping, tính toán (+ test)
├─ plugins/              # bật/tắt được (dạng câu hỏi, ai-assist)
│  ├─ registry.ts        # danh sách plugin tĩnh: file DUY NHẤT tầng khác được import
│  └─ <plugin>/          # manifest + Editor/Player/Review + grade.ts (+ test)
├─ themes/neobrutal/     # ui/ (shadcn neobrutalism), lib/utils.ts. Không chứa nghiệp vụ.
└─ test/                 # helper test dùng chung (db.ts, ...)
supabase/                # config.toml, migrations/*.sql, seed.sql
scripts/                 # script tooling (.mjs)
```

Không đặt ở gốc repo: tài liệu PoC, demo, dữ liệu cá nhân. `/specs/` đã gitignore để chứa dữ liệu gia đình, không được đọc dữ liệu đó vào code hay seed.

## 2. Quy tắc phụ thuộc (ESLint ép buộc)

```
app ──► plugins/registry, packages/*(index), core, themes
plugins/<p> ──► packages/*(index), core, themes
packages/<a> ──► packages/<b>(index), core, themes, plugins/registry (ngoại lệ duy nhất đi ngược)
core ──► themes (chỉ khi thật cần); KHÔNG import packages/plugins/app
themes ──► chỉ thư viện ngoài
```

- Không import sâu vào file nội bộ (`@/packages/x/lib/y`). Nếu cần thì export qua `index.ts`, hoặc chuyển xuống `core/` nếu đó là hạ tầng.
- Hai module cùng cần một thứ hạ tầng → đưa thứ đó vào `core/`.
- Plugin không import plugin khác.
- Không có vòng phụ thuộc.
- Lưu ý `index.ts`: không gộp chung code `'use server'`, `server-only` và component client vào một barrel nếu làm hỏng bundle client. Khi cần, tách thêm entry `@/packages/x/client`.

## 3. Path alias

Luôn dùng `@/` (→ `src/`). Import tương đối chỉ dùng bên trong cùng một module hoặc plugin (`./components/X`, `../lib/y`). Cấm `../../`.

## 4. Dữ liệu: đọc, ghi, bảo mật

- **Đọc:** trong server component, dùng `createClient()` từ `@/core/supabase/server`, đặt trong `queries.ts` của module. Chỉ select những cột cần dùng.
- **Ghi:** dùng server action trong `actions.ts`. Mỗi action **bắt đầu bằng guard** (`requireRole(...)` hoặc `getCurrentKid()`), validate input bằng zod, trả về `ActionState` (`{ ok, error? }`), rồi `revalidatePath(PATHS...)`.
- **RLS là tuyến phòng thủ chính.** Mọi bảng đều bật RLS. Service role (`@/core/supabase/admin`) chỉ dùng cho thao tác admin cần thiết, ví dụ tạo user auth.
- Biến bí mật (`SUPABASE_SERVICE_ROLE_KEY`, `KID_SESSION_SECRET`, ...) chỉ dùng trong file có `import 'server-only'`. Biến công khai dùng tiền tố `NEXT_PUBLIC_`. Mọi biến đều phải có trong `.env.example`.
- Đáp án câu hỏi (`questions.answer`) không bao giờ được gửi xuống client của trẻ trước khi bài cho phép xem đáp án.
- Lỗi DB đổi thành thông báo tiếng Việt bằng hàm thuần trong `lib/` (theo mã lỗi Postgres như `23503`, `23505`). Component không so sánh chuỗi message.
- Migration SQL đặt trong `supabase/migrations/`. Sau khi đổi schema, chạy `npm run db:types`.

## 5. Bên trong một module

- Ngưỡng tách: thư mục gốc của module có hơn khoảng 15 file thì chia vào `components/ hooks/ lib/`. Module lớn hơn khoảng 80 file thì tách thành nhiều module.
- Component dưới khoảng 300 dòng, tối đa khoảng 500. View lớn thì tách hook và component con.
- `View.tsx` chỉ điều phối: lấy dữ liệu, render component con. Logic thuần đặt trong `lib/` để test không cần render.
- Chia theo vai trò, không chia theo phiên bản (`v2/`, `poc*` bị cấm). Cần chạy song song bản cũ và mới thì dùng cờ trong bảng `settings`.

## 6. Plugin

- Mỗi dạng câu hỏi là một plugin tuân theo `QuestionTypePlugin` trong `@/core/plugins`: gồm `contentSchema`, `answerSchema`, `responseSchema`, `Editor`, `Player`, `Review`, `grade()`.
- `grade()` là hàm thuần, chỉ chạy ở server, bắt buộc có test.
- Đăng ký plugin trong `src/plugins/registry.ts`. Admin bật/tắt qua bảng `plugins`, plugin bị tắt vẫn render được dữ liệu cũ.

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

- Vitest, test đặt cạnh code. `npm test` chạy test thuần (không cần DB).
- `npm run test:db` chạy `*.db.test.ts` trên Supabase local (`npx supabase start`, cần Docker). Mọi thay đổi RLS phải có test ở đây.
- Ưu tiên test `lib/`, `grade()` của plugin và RLS. Luồng giao diện kiểm tra thủ công trên điện thoại, tablet và laptop.

## 10. Tooling

- TS `strict`. ESLint (next + luật ranh giới) + Prettier.
- Husky: pre-commit chạy `lint-staged`; pre-push chạy `lint`, `typecheck`, `test`.
- Scripts: `dev`, `build`, `lint`, `lint:fix`, `typecheck`, `test`, `test:db`, `format`, `format:check`, `db:types`.
- Deploy lên Vercel. Áp migration lên Supabase thật chỉ khi chủ repo đồng ý.

## 11. Checklist khi thêm module mới

1. Tạo `src/packages/<module>/` có `index.ts` và `<Module>View.tsx`.
2. Nếu cần bảng mới: viết migration có RLS, test trong `*.db.test.ts`, chạy `npm run db:types`.
3. Thêm path vào `PATHS`, tạo route mỏng trong `src/app/...` dưới đúng layout có guard.
4. Server action: guard → zod → DB → `revalidatePath`.
5. Dùng component từ `@/themes/neobrutal/ui`, không hard-code màu.
6. Test cho `lib/`. `npm run lint && npm run typecheck && npm test` phải xanh.

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
| Tên thật của trẻ trong code hay seed | Admin nhập qua giao diện |
