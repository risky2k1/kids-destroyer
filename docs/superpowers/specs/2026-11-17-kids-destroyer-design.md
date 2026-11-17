# Kids Destroyer: Thiết kế

Ngày: 2026-11-17 · Trạng thái: đã duyệt

## 1. Mục đích

App luyện tập dùng **trong đại gia đình**: phụ huynh giao bài, trẻ làm bài, máy chấm phần chấm được, phụ huynh chấm phần còn lại và nhận xét. Đối tượng chính là 2 bé lớp 2 (sinh 2019, ở 2 nhà khác nhau). Có 2 bé sinh 2024 (khoảng 2 tuổi), ưu tiên thấp. Có 3 gia đình, mỗi nhà 2 phụ huynh. Chủ repo là admin.

Lý do: tạo bài luyện theo ý mình (Toán, Tiếng Anh, sau này thêm môn), dùng được trên mọi thiết bị trong nhà, không phụ thuộc app bên ngoài.

## 2. Mục tiêu / Ngoài phạm vi / Thất bại nếu

**Mục tiêu (v1)**
- Admin: quản lý môn, lớp, chủ đề; gia đình, tài khoản phụ huynh, hồ sơ trẻ; bật/tắt plugin; cài đặt chung.
- Phụ huynh: ngân hàng câu hỏi (dùng chung cả 3 nhà) → đề (nhiều câu) → giao cho trẻ trong nhà mình (có hạn nộp) → xem kết quả, chấm tay câu tự luận/giọng nói, nhận xét cả bài.
- Trẻ: chọn avatar + PIN → xem bài được giao → làm bài → xem điểm và nhận xét → **làm lại câu sai đúng 1 lần**.
- Dạng câu hỏi v1, mỗi dạng 1 plugin: trắc nghiệm (1 hoặc nhiều đáp án), điền từ vào chỗ trống, nhập số, sắp xếp thứ tự, ghép cặp, viết câu/đoạn (chấm tay), thu âm giọng nói (chấm tay).
- Mọi câu có nút 🔊 đọc đề (Web Speech `speechSynthesis`, giọng đọc theo `lang` của câu: `vi-VN` / `en-US`; ẩn nút nếu thiết bị không có giọng đọc phù hợp).
- Responsive cho điện thoại, máy tính bảng, laptop. Hỗ trợ chuột và cảm ứng.

**Giai đoạn 2 (không thuộc v1, nhưng thiết kế phải chừa chỗ)**
- Plugin `ai-assist`: phụ huynh nhập mô tả → AI soạn nháp câu hỏi → phụ huynh duyệt. AI chấm nháp tự luận → phụ huynh xác nhận. Gọi qua OpenRouter (API tương thích OpenAI), model và key nằm trong cài đặt của plugin. Mặc định `openrouter/free`.
- Nhận dạng giọng nói (STT) để chấm tự động.

**Ngoài phạm vi:** nhiều tenant hoặc người ngoài đăng ký, bảng xếp hạng, push/email, biểu đồ tiến bộ theo thời gian, import đề, cài plugin lúc chạy, đa ngôn ngữ giao diện, Redis.

**Thất bại nếu:**
- Trẻ xem được đáp án qua devtools hoặc response mạng.
- Phụ huynh nhà này thấy con hoặc kết quả của nhà khác.
- Soạn một câu hỏi mất quá lâu khiến không ai muốn soạn.
- Trẻ lớp 2 không tự làm được bài trên điện thoại (bấm trượt, chữ nhỏ).
- Tên thật của trẻ bị commit vào repo hoặc gửi cho AI.

## 3. Ràng buộc

- Next.js **16.2** (App Router) + React 19.2 + Tailwind 4, đã có trong repo. **Đọc `node_modules/next/dist/docs/` sau khi `npm install`, trước khi viết code** (AGENTS.md: API khác với kiến thức cũ, ví dụ middleware/proxy, cache).
- Deploy lên Vercel. Không có tiến trình chạy nền lâu, không cài plugin lúc chạy.
- Supabase đã kết nối (`.env.local`, đã gitignore): Auth, Postgres + RLS, Storage. `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY` và `SUPABASE_JWT_SECRET` **chỉ dùng ở server**, không bao giờ đặt tiền tố `NEXT_PUBLIC_`.
- Giao diện theo phong cách neobrutalism (https://www.neobrutalism.dev/, là component shadcn: viền đen dày, bóng đổ cứng, màu nổi).
- Cấu trúc code theo skill `fe-react-structure`, chuyển sang bản Next.js (mục 5).
- Dữ liệu cá nhân của gia đình nằm trong `/specs/` (gitignored). Không đưa vào code, seed hay tài liệu được commit.

## 4. Các phương án (đã chọn A)

| | Phương án | Đánh đổi |
|---|---|---|
| **A ✅** | Một app Next.js, chia `core / packages / plugins / themes` bằng thư mục. Plugin đăng ký tĩnh, admin bật/tắt qua DB. ESLint giữ ranh giới giữa các tầng. | Nhanh, deploy Vercel không cần cấu hình thêm. Ranh giới chỉ được giữ bằng lint. Sau này chuyển sang B được bằng cách dời thư mục. |
| B | Monorepo pnpm + Turborepo, mỗi plugin là 1 package. | Ranh giới thật như Botble, nhưng gấp đôi cấu hình. Quá nặng cho app dùng trong nhà. |
| C | Chỉ dùng feature-based, các dạng câu hỏi là `switch`. | Ít code nhất, nhưng mất cấu trúc Botble chủ repo muốn. Thêm dạng mới phải sửa lõi. |

Chủ repo chọn A.

## 5. Kiến trúc

```
src/
  app/                 # CHỈ chứa route Next.js: page/layout/route/actions mỏng, ráp từ các tầng dưới
    (auth)/login
    admin/...          # khu admin
    parent/...         # khu phụ huynh
    kid/...            # khu trẻ (chọn avatar + PIN, làm bài)
  core/                # kernel, không biết đến domain hay plugin cụ thể
    supabase/          # client cho server/browser/admin (service role, server-only)
    auth/              # session phụ huynh/admin, session trẻ, guard
    acl/               # role: admin | parent; các hàm kiểm tra quyền
    settings/          # đọc/ghi bảng settings
    plugins/           # kiểu QuestionTypePlugin, PluginManifest; đọc trạng thái bật/tắt
  packages/            # module domain luôn bật; mỗi module có index.ts (public API)
    catalog/           # môn, lớp, chủ đề
    family/            # gia đình, phụ huynh, hồ sơ trẻ, PIN
    question-bank/
    quiz/              # đề + câu trong đề
    assignment/        # giao bài, làm bài, nộp, chấm, làm lại
  plugins/             # có thể bật/tắt
    registry.ts        # danh sách plugin tĩnh, là file DUY NHẤT của plugins/ mà tầng khác được import
    question-mcq/  question-fill/  question-number/  question-order/
    question-match/  question-writing/  question-voice/
    (ai-assist/ ở giai đoạn 2)
  themes/neobrutal/    # tokens (CSS var trong globals) + component UI dạng shadcn neobrutalism
```

**Ánh xạ từ skill `fe-react-structure` (SPA Vite) sang dự án này:**
- `src/app` của skill (providers, router, guards, layouts) → route Next.js trong `src/app` (layout, guard dùng phía server). Bỏ react-router và `PATHS` builder; thay bằng hằng số đường dẫn trong `core/routes.ts`.
- `features/<f>` → `packages/<f>` (luôn bật) hoặc `plugins/<p>` (bật/tắt được). Vẫn giữ `index.ts` làm public API, cùng các thư mục `components/ hooks/ lib/`.
- `shared/` → `core/` (hạ tầng) + `themes/neobrutal/` (UI trình bày).
- `shared/api/httpClient` → không cần. Đọc dữ liệu bằng Supabase trong server component, ghi dữ liệu bằng server action.
- `VITE_*` → `NEXT_PUBLIC_*` (chỉ biến công khai). Mọi biến môi trường liệt kê trong `.env.example`.
- **Lệch khỏi skill:** không dùng i18n (`t()`). Giao diện chỉ có tiếng Việt và viết thẳng chuỗi. Lý do: dùng trong nhà, YAGNI. Nội dung tiếng Anh là dữ liệu câu hỏi, không phải chuỗi giao diện.
- Skill sau khi chuyển được lưu thành skill dự án tại `.claude/skills/fe-react-structure/SKILL.md`. Thư mục `fe-react-structure/` ở gốc repo được dời vào đó.

**Quy tắc phụ thuộc (ESLint `no-restricted-imports` ép buộc):**
```
app ─► plugins/registry, packages/*(index), core, themes
plugins/<p> ─► packages/*(index), core, themes
packages/<a> ─► packages/<b>(index), core, themes, plugins/registry
core ─► themes (chỉ khi thật cần); không bao giờ import packages/plugins
```
`packages/assignment` cần plugin để render và chấm, nên được import `plugins/registry`. Đây là ngoại lệ duy nhất đi ngược chiều, và được ghi rõ trong cấu hình lint.

**Hợp đồng plugin dạng câu hỏi** (định nghĩa trong `core/plugins`):
```ts
interface QuestionTypePlugin<Content, Answer, Response> {
  id: string                    // 'mcq', 'fill', ... lưu ở questions.type
  name: string                  // tên tiếng Việt hiển thị
  contentSchema: ZodType<Content>   // phần trẻ được thấy
  answerSchema: ZodType<Answer>     // đáp án, KHÔNG gửi xuống client của trẻ
  responseSchema: ZodType<Response> // câu trả lời của trẻ
  Editor: ComponentType<...>    // phụ huynh soạn content + answer
  Player: ComponentType<{ content; value; onChange; disabled }> // trẻ làm bài
  Review: ComponentType<{ content; answer; response; result }>   // xem lại, chấm
  grade(content, answer, response): { score: number /*0..1*/; needsManual: boolean }
}
```
- `grade` chỉ chạy ở server (server action khi nộp bài). Plugin chấm tay (`writing`, `voice`) trả về `needsManual: true`.
- `registry.ts` export map `id → plugin`. Builder tự quyết cách tách phần client/server (ví dụ `registry.client.ts` / `registry.server.ts`) sao cho bundle của trẻ không chứa đáp án. Đáp án vốn không bao giờ được gửi xuống client, nên đây chủ yếu là để bundle gọn.
- Plugin bị admin tắt: ẩn khỏi Editor (không tạo câu mới được), nhưng câu đã có vẫn render và chấm bình thường.
- Không làm hệ hook/filter tổng quát kiểu Botble. Điểm mở rộng duy nhất ở v1 là danh sách dạng câu hỏi. Khi plugin `ai-assist` cần chèn nút vào Editor thì thêm điểm mở rộng có kiểu rõ ràng lúc đó.

## 6. Dữ liệu (Supabase Postgres)

Migration SQL đặt trong `supabase/migrations/`. Sinh kiểu TS bằng `supabase gen types`.

| Bảng | Cột chính | Ghi chú |
|---|---|---|
| `families` | id, name | |
| `profiles` | id (= auth.users.id), role `admin\|parent`, family_id, display_name | admin có thể không thuộc nhà nào |
| `kids` | id, family_id, display_name, avatar, grade_id, pin_hash, pin_failed_count, pin_locked_until | trẻ **không** có tài khoản auth |
| `subjects`, `grades` | id, name, sort | admin quản lý |
| `topics` | id, subject_id, grade_id, name | |
| `plugins` | id, enabled, settings jsonb | |
| `settings` | key, value jsonb | |
| `questions` | id, type, subject_id, grade_id, topic_id, lang `vi\|en`, prompt, content jsonb, answer jsonb, created_by | dùng chung cả 3 nhà |
| `quizzes` | id, title, subject_id, grade_id, created_by | |
| `quiz_questions` | quiz_id, question_id, position, points | |
| `assignments` | id, quiz_id, kid_id, assigned_by, due_at, status `assigned\|submitted\|reviewed`, parent_comment | |
| `attempts` | id, assignment_id, round `1\|2`, submitted_at, score | round 2 = làm lại câu sai |
| `responses` | attempt_id, question_id, response jsonb, auto_score, manual_score, feedback, media_path | |

**RLS (bắt buộc bật trên mọi bảng):**
- admin: toàn quyền.
- parent: đọc catalog, questions, quizzes. Sửa questions/quizzes do chính mình tạo. Đọc và ghi kids, assignments, attempts, responses **chỉ của trẻ trong `family_id` của mình**.
- `answer` của questions: client của trẻ không bao giờ đọc. Trang làm bài lấy dữ liệu qua server, chỉ chọn `content`. Builder chọn cách làm: tách cột theo view, hoặc chỉ select cột cần thiết ở server.
- Storage bucket `voice` để private. Đường dẫn file `family_id/assignment_id/...`. Phát lại bằng signed URL.

## 7. Luồng chính

**Đăng nhập**
- Admin và phụ huynh: Supabase email + mật khẩu. Tắt đăng ký công khai. Admin tạo tài khoản phụ huynh qua server action dùng service role.
- **Chế độ trẻ:** phụ huynh đã đăng nhập trên thiết bị → bấm "Cho bé làm bài" → màn chọn avatar (các bé trong nhà) → nhập PIN 4 số → server kiểm tra (`scrypt` của `node:crypto`), rồi đặt cookie httpOnly có ký chứa `kid_id`. Mọi thao tác ở khu trẻ chạy bằng server action: kiểm tra cookie trẻ, kiểm tra trẻ thuộc nhà của phiên phụ huynh, rồi mới đọc/ghi. Sai PIN 5 lần thì khóa 5 phút (đếm ngay trong DB, không cần Redis).
- Thoát chế độ trẻ để về khu phụ huynh: phải nhập lại mật khẩu phụ huynh, hoặc dùng PIN phụ huynh nếu builder thấy gọn hơn. Mục đích là trẻ không tự sửa điểm được.

**Soạn và giao bài:** phụ huynh tạo câu hỏi (chọn môn, lớp, chủ đề, dạng → Editor của plugin) → tạo đề (lọc ngân hàng theo môn và lớp, chọn câu, sắp thứ tự, đặt điểm) → giao cho một hoặc nhiều trẻ trong nhà, kèm hạn nộp.

**Làm bài:** trẻ thấy danh sách bài → làm từng câu (Player, nút 🔊) → nộp → server chấm từng câu bằng `grade` → nếu còn câu cần chấm tay thì bài ở trạng thái `submitted`, ngược lại là `reviewed` → trẻ xem điểm → nếu có câu sai thì được làm lại 1 lần (round 2, chỉ các câu sai). Điểm cuối cùng do builder chọn cách tính, ví dụ lấy điểm cao nhất của mỗi câu, và phải ghi rõ cách tính.

**Chấm và nhận xét:** phụ huynh mở bài → xem Review từng câu → nhập `manual_score` + `feedback` cho câu tự luận/giọng nói → nhận xét chung → `reviewed`.

**Tương tác ghép/xếp:** hỗ trợ cả kéo thả và **chạm chọn rồi chạm vào ô đích**. Vùng bấm tối thiểu 44px.

**Thu âm:** `MediaRecorder`, giới hạn độ dài (ví dụ 60 giây), upload lên bucket `voice`. Có kiểm tra định dạng tương thích Safari (mp4/aac) và Chrome (webm/opus).

## 8. Giao diện

- Theme neobrutalism lấy từ registry shadcn của neobrutalism.dev. Token màu và font khai báo một chỗ trong `themes/neobrutal`, map sang CSS variable. Không hard-code màu trong component.
- Khu trẻ: chữ lớn, nút lớn, ít chữ, có sao thưởng khi xong bài. Không có bảng xếp hạng.
- Khu phụ huynh/admin: bảng và form gọn, dùng tốt trên điện thoại.

## 9. Kiểm thử

- Vitest: `grade()` của từng plugin (bắt buộc), schema của plugin, các hàm thuần trong `lib/`, cách tính điểm có làm lại.
- Kiểm tra RLS bằng script/SQL: phụ huynh nhà A không đọc được trẻ hay bài của nhà B; truy vấn của trẻ không trả về `answer`.
- Smoke test thủ công trên 3 loại thiết bị cho luồng làm bài.

## 10. Hạ tầng / biến môi trường

- Đã có: Supabase (URL, publishable/anon key, service role, Postgres URL).
- Cần thêm: `KID_SESSION_SECRET` (ký cookie trẻ). Giai đoạn 2: `OPENROUTER_API_KEY` (hoặc lưu trong settings của plugin).
- Redis: **không cần** ở v1.
- Áp dụng migration lên project Supabase thật là thao tác ghi ra bên ngoài. Phải hỏi chủ repo trước lần đầu chạy.

## 11. Quyết định bổ sung (sau vòng review của builder)

Các mục đánh dấu *(quyết định của Claude)* là đề xuất của Claude, chủ repo có thể sửa.

- **Phiên làm bài của trẻ** *(quyết định của Claude)*: chế độ trẻ chỉ hợp lệ khi phiên phụ huynh trên thiết bị còn sống. Supabase tự refresh token nên trên thực tế phiên kéo dài. Phiên phụ huynh hết hạn thì quay về màn đăng nhập. Không làm cơ chế gắn với thiết bị.
- **Truy cập DB ở khu trẻ** *(quyết định của Claude)*: server action dùng **chính phiên Supabase của phụ huynh** đang đăng nhập, nên RLS theo `family_id` vẫn áp dụng. Server action kiểm tra thêm `kid_id` trong cookie thuộc nhà đó. **Không** dùng service role cho khu trẻ, **không** tự ký JWT. Service role chỉ dùng cho các thao tác admin (tạo user).
- **Admin** *(quyết định của Claude)*: chủ repo không thuộc nhà nào, có toàn quyền, có thể giao bài và chấm cho mọi nhà. Không dùng chế độ trẻ.
- **Hai phụ huynh cùng nhà** cùng giao và chấm được mọi bài của nhà mình. Bản ghi sau ghi đè bản trước, không cần xử lý xung đột.
- **Tính điểm** *(quyết định của Claude)*: điểm câu = `score × points`. Điểm bài = tổng, quy về thang 10 để hiển thị. "Sai" nghĩa là `score < 1` và câu đó được chấm tự động.
- **Làm lại** *(quyết định của Claude)*: được làm ngay sau khi nộp round 1, chỉ các câu **chấm tự động** bị sai. Câu chấm tay không được làm lại. Mỗi câu lấy điểm cao nhất trong 2 round. Round 2 không đổi trạng thái chấm tay của bài. `responses` có unique `(attempt_id, question_id)`, mỗi round là một `attempts` riêng.
- **Ngân hàng đề dùng chung** *(quyết định của Claude)*: mọi phụ huynh xem và dùng được mọi câu hỏi và đề. Chỉ người tạo hoặc admin được sửa. Câu đã nằm trong một bài đã giao thì **không sửa hoặc xóa được**: có nút "Nhân bản để sửa", và xóa là ẩn đi (soft delete, cột `archived_at`). Nhờ vậy không cần snapshot dữ liệu.
- **Khóa PIN** tính riêng từng trẻ. Chấp nhận việc anh chị em trong nhà có thể làm khóa PIN của nhau 5 phút.
- **Dữ liệu thật** (tên gia đình, tên trẻ): admin nhập tay qua giao diện. Không có script seed đọc từ `/specs/`.
- **Trẻ xem đáp án** (chủ repo đã chốt): sau round 1 chỉ hiện đúng ✅ / sai ❌, **không** gửi `answer` xuống client. Sau khi xong round 2, hoặc khi trẻ bỏ qua bước làm lại (bài không còn câu được làm lại), mới hiện đáp án đúng của mọi câu kèm nhận xét. Server chỉ trả `answer` cho trẻ khi bài đã ở trạng thái đó.

## 12. Để builder tự quyết

- Tách registry client/server thế nào; cấu trúc component cụ thể bên trong plugin.
- Thư viện kéo thả (dnd-kit hoặc tự viết với pointer events). Chọn cái nhỏ nhất mà chạy được trên cảm ứng.
- Cách ẩn `answer` (view hay select cột); cách tính điểm tổng khi có làm lại (ghi rõ).
- Thứ tự làm các plugin, nhưng `mcq` + `fill` + `number` phải xong trước để chạy được luồng end-to-end.
- Dùng mật khẩu hay PIN phụ huynh để thoát chế độ trẻ.
