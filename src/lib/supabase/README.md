# Supabase Integration Notes

Project này hiện đang chạy bằng `mockAppApi` để hoàn thiện UI và flow trước.

Khi chuyển sang Supabase, thứ tự nên là:

1. Tạo project Supabase.
2. Chạy SQL trong [schema.sql](/D:/laptrinh/react/testvibecode/patreon clone/supabase/schema.sql).
3. Thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` vào `.env`.
4. Cài `@supabase/supabase-js`.
5. Tạo `src/lib/supabase/client.ts`.
6. Thay `mockAppApi` bằng adapter Supabase nhưng giữ nguyên contract của `AppApi`.

Kiến trúc hiện tại đã chuẩn bị sẵn:

- `src/types/appData.ts`: contract dữ liệu dùng chung giữa UI và backend adapter.
- `src/services/appApi.ts`: interface service.
- `src/services/mockAppApi.ts`: adapter hiện tại.
- `src/data/mockApi.ts`: seed/mock data cho local development.

Mục tiêu là để UI không phụ thuộc vào việc backend là mock hay Supabase.
