# Cấu hình Biến Môi Trường (.env)

Dự án hiện tại chưa sử dụng tệp `.env`, nhưng đây là một phương pháp rất tốt để quản lý các biến cấu hình thay vì hard-code chúng trực tiếp trong mã nguồn. Điều này giúp tăng tính bảo mật và linh hoạt khi triển khai ở các môi trường khác nhau.

### Ví dụ về tệp `.env`

Để sử dụng, bạn có thể tạo một tệp có tên `.env` ở thư mục gốc của dự án:

```env
# URL của PocketBase backend.
# Tiền tố VITE_ là bắt buộc để Vite có thể truy cập biến này ở phía client.
VITE_POCKETBASE_URL=https://api.cafenho.site
```

### Cách sử dụng trong mã nguồn

Sau đó, bạn có thể cập nhật mã nguồn trong `src/index.tsx` để đọc giá trị từ biến môi trường:

```typescript
// Thay thế dòng code cũ:
// const POCKETBASE_URL = 'https://api.cafenho.site';

// Bằng dòng code mới:
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL;
```

**Lưu ý:** Sau khi tạo hoặc thay đổi tệp `.env`, bạn cần khởi động lại server development để các thay đổi có hiệu lực.
