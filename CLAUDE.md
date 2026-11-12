# PortPholio — Project Rules

Rules riêng của project này, bổ sung trên global rules. File này là nguồn lưu ý chung cho mọi phiên
Claude (VS Code, terminal, claude.ai/code trên web): phiên web không đọc được ghi nhớ trên máy, nên
mọi lưu ý cần giữ lâu dài phải nằm ở đây.

## Stack
- Frontend (`frontend/`): React 19 + TypeScript + Vite + Tailwind v4 + Framer Motion + TanStack Query.
- Backend: Node.js + Express + Drizzle ORM.
- Database: Supabase (PostgreSQL, RLS).

## Supabase
- Dùng Supabase JS client cho queries, không connect trực tiếp DB.
- Migration nằm trong `supabase/migrations/NNN_<mô_tả>.sql`, **người dùng tự chạy** trong SQL Editor.
- Thứ tự khi đổi schema: commit migration → người dùng chạy SQL → kiểm tra → mới push code cần nó.
  Không bao giờ push code cần migration trước khi người dùng xác nhận đã chạy.
- Không hỏi các secret (service role key, VAPID private key, CRON_SECRET); người dùng tự thêm.

## Deploy
- Push lên `main` = Vercel tự deploy frontend (https://port-pholio-frontend.vercel.app).
- GitHub Actions (`ci.yml`, `deploy.yml`) chỉ chạy tay (`workflow_dispatch`): tài khoản GitHub bị khóa
  billing và người dùng muốn mọi thứ miễn phí. Không bật lại chạy theo push, không thêm dịch vụ trả phí.
- Commit message: Conventional Commits, tiếng Anh, ghi rõ triệu chứng, nguyên nhân, cách sửa, cách kiểm chứng.

## App `/roadmap` — "Road to Big Tech"
App học tập cá nhân (PWA), người dùng học hằng ngày trên iPhone 15 (PWA) và máy tính. Mọi thay đổi lên
`main` đến tay người dùng ngay, nên luôn kiểm tra trước khi push.

### Ngôn ngữ và nội dung
- Toàn bộ chữ trên giao diện bằng **tiếng Anh**, trình độ A2–B1, kèm thuật ngữ chuyên ngành.
  Không có tiếng Việt trên giao diện; chỉ công cụ bôi đen để dịch (`SelectionTranslator`) mới hiện tiếng Việt.
- Thuật ngữ khó trong bài: đánh dấu `[[key]]` hoặc `[[key|chữ hiển thị]]`, và thêm vào
  `frontend/src/data/lessons/glossary.ts` dạng `{ area, en, example }`: giải thích tiếng Anh dễ hiểu +
  **một ví dụ thực tế**. `area` quyết định chủ đề trong tab Library.
- Thẻ lý thuyết chỉ chọn kiến thức đáng giá nhất: hay hỏi khi phỏng vấn, dùng nhiều khi đi làm, rèn tư
  duy. Mỗi thẻ trả lời: nhận ra khi nào dùng, mô hình tư duy, mẫu dùng lại, đánh đổi, lỗi hay gặp, dùng ở đâu
  khi đi làm.
- Mọi link nguồn (kể cả `#anchor`) và mọi output in ra trong ví dụ phải được kiểm tra thật trước khi push.
- Mỗi bài nên có khung `{ type: 'callout', tone: 'compare' }` ("In other languages") ở những chỗ đáng so sánh:
  ngôn ngữ khác (C, Java, JavaScript, Go, Rust…) làm việc đó thế nào, điểm mạnh / yếu so với Python.
- Hàm/công cụ Python mới hay dùng: thêm vào `frontend/src/data/reference/python.ts` (ví dụ có comment output,
  `check:lessons` chạy và so khớp từng dòng print).

### Bài học (`frontend/src/data/lessons/`)
Mỗi bài mới phải có đủ:
- Bài học (`python.ts`, `pythonSyntax.ts`, `dsa.ts`, `cs.ts`), `videos` (YouTube id đã kiểm tra qua oEmbed).
- Test trong `tests/`: phần trắc nghiệm ~12 concept, **mỗi concept ≥ 2 câu** (câu thứ hai trong
  `tests/variants.ts` hoặc file variants của bài; làm lại thì đổi câu ở concept làm sai) + 2 bài code
  + 2–3 câu phỏng vấn. Task "Lesson:" bị khóa cho tới khi qua test.
- Nguồn cho từng concept/bài trong `tests/sources.ts`.
- Test **chỉ được dùng kiến thức bài đó hoặc bài trước đã dạy**; thiếu thì dạy thêm trong bài hoặc đổi câu.
- Chạy `npm run check:lessons` (chạy Python thật trên mọi ví dụ, bài tập và câu "What does this print?").
- Thêm task vào lịch trong `frontend/src/data/roadmap/plan.ts`. Đổi lịch không được làm đổi id của task
  ở các ngày khác (id = `ngày:slug-tiêu-đề`; tiến độ đã lưu dựa vào id).
- Mục lục bài, tìm kiếm và tab Library tự sinh từ cấu trúc bài (`## heading`, bài tập, sơ đồ động).
  Sơ đồ động mới: thêm vào `components/learn/visuals` và `VISUAL_TITLES`.
- Thẻ AI/Career nằm ở `data/roadmap/practicalReferences.ts`, gắn vào task theo tiêu đề (`PRACTICAL_RULES`).
  Key mới trong `CS_REFERENCES` cần thêm vào `CS_GROUPS` trong `data/library.ts`.
- Tab Library không liệt kê 150 bài NeetCode (đã có ở Today) — người dùng không muốn.

### Khóa học, lộ trình tháng và bài kiểm tra
- Lộ trình chia theo tháng từ 16/11/2026: `m1` (16/11–13/12), `m2` (14/12–31/12), từ 2027 là các phase cũ.
- Plan → **Course** (`data/course.ts`, `components/roadmap/CourseView.tsx`) gom mọi thứ theo chủ đề; người học
  học bất kỳ bài nào, lúc nào; test của bài nằm cuối mỗi bài (làm lại được). Bài mới phải thêm vào đúng module ở đây.
- Bài chưa viết trong lịch dùng `plannedLesson(id, title, kind)` trong `plan.ts`; khi viết bài, `id` và `title`
  phải trùng y hệt để id task không đổi (plan.ts báo lỗi nếu lệch).
- Phỏng vấn thử: `data/lessons/mockTests.ts`, theo ngày. Cuối tuần (CN) = quiz bài trong tuần + 1 bài code + 2 câu
  nói, dễ hơn; cuối tháng = quiz cả tháng + 2 bài code + 4 câu nói, có đồng hồ. Chỉ dùng kiến thức đã dạy.
- URL giữ màn hình đang mở (`hooks/useSavedView.ts` → `useRoadmapRoute`): `/roadmap/today/<ngày>` (`#test` = cuộn tới
  bài test của ngày), `/roadmap/plan/course|schedule`, `/roadmap/library[/<topic>]`, `/roadmap/notes`,
  `/roadmap/learn/<id>[#<mục>]`. `/roadmap` (start_url của PWA) mở lại màn hình lần trước. Đổi ngày/chế độ/topic
  dùng `replace`, đổi tab thì thêm vào lịch sử. Màn hình mới phải có path, không giữ trạng thái chỉ trong state.
- Bài có id `sd-` hiện ở chủ đề System design của Library (`lessonTopic` trong `data/library.ts`).

### Dữ liệu và đồng bộ giữa các máy
- Đọc Supabase qua `fetchAllRows` (vượt giới hạn 1.000 dòng, cần `order` ổn định).
- `lib/queryPersistence.ts` lưu bản sao dữ liệu học vào localStorage để mở nhanh và dùng offline.
  Bản sao khôi phục có `updatedAt: 0` (luôn cũ). Các query được lưu phải `refetchOnMount: 'always'`,
  không dùng `staleTime: Infinity`.
- Thứ gì ghi ngược lên server (bài test, bộ flashcard) phải đợi dữ liệu được cập nhật sau
  `PAGE_LOADED_AT` (hoặc đang offline). Không dùng `isFetchedAfterMount` (không bao giờ true khi key đổi
  sau đăng nhập → Day test treo). Sai một trong hai điều này thì máy tính và iPhone hiện tiến độ khác nhau.

### Lỗi đã gặp — đừng lặp lại
- `components` của react-markdown phải khai báo ở cấp module (object inline làm GlossTerm remount, đóng thẻ giải thích).
- Trên iPhone, nút dùng khi bàn phím đang mở phải xử lý ở `pointerdown` (iOS bỏ mất `click` đầu tiên);
  thanh công cụ cạnh ô nhập không dùng `position: fixed`.
- Phần tử kéo được (vuốt câu hỏi) không được nuốt thao tác cuộn ngang của code bên trong.
- Grid chứa code/bảng dài cần `grid-cols-1` + `min-w-0`, nếu không trang bị tràn ngang trên điện thoại.

### Kiểm tra trước khi push (trong `frontend/`)
- `npx tsc -b`, `npm run lint` (0 lỗi), `npm run check:lessons`, `npm run build`.
- Thay đổi giao diện: kiểm tra ở bề ngang điện thoại (390px) — không tràn ngang, không chữ bị cắt.
- Lỗi chỉ có trên iPhone thật mà Playwright WebKit không tái hiện được: nói rõ với người dùng và nhờ họ thử.

### Làm việc với người dùng
- Trả lời tiếng Việt, xưng "tôi", gọi "bạn"; ngắn gọn.
- Việc cần người dùng tự làm (chạy SQL, cấu hình): chỉ đưa bước tiếp theo, chờ kết quả rồi mới sang bước sau.
- Người dùng sẽ góp ý về độ dài/độ khó sau khi học thử tuần 0–1; các bài từ tuần 2 cần chỉnh theo góp ý đó.
