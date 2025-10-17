# Thư Viện Prompt

Chào mừng bạn đến với Thư Viện Prompt! Đây là một ứng dụng web hiện đại, được xây dựng bằng React và Vite, dùng để khám phá và sao chép các prompt tạo hình ảnh. Ứng dụng kết nối với PocketBase backend để hiển thị một bộ sưu tập các prompt được tuyển chọn theo thời gian thực.

![Ảnh chụp màn hình ứng dụng Thư Viện Prompt](./screenshot.png) <!-- Nên thêm ảnh chụp màn hình của ứng dụng với tên screenshot.png vào thư mục gốc -->

## ✨ Tính Năng Nổi Bật

- **Dữ liệu thời gian thực:** Tự động cập nhật dữ liệu từ PocketBase mà không cần tải lại trang.
- **Lọc theo danh mục:** Dễ dàng lọc các prompt theo nhiều danh mục khác nhau (Nam, Nữ, Couple, v.v.).
- **Phân trang thông minh:** Duyệt qua hàng trăm prompt một cách hiệu quả với tùy chọn số lượng hiển thị trên mỗi trang.
- **Thiết kế Responsive:** Giao diện đẹp mắt và hoạt động mượt mà trên mọi thiết bị, từ điện thoại di động đến máy tính để bàn.
- **Giao diện hiện đại (UI/UX):** Sử dụng dark theme, hiệu ứng chuyển động mượt mà, skeleton loader để cải thiện trải nghiệm tải trang và nút sao chép tương tác.
- **Tối ưu cho Production:** Được cấu hình sẵn để triển khai như một ứng dụng Node.js độc lập, tối ưu hóa qua Docker.

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** [React](https://reactjs.org/) với [Vite](https://vitejs.dev/)
- **Ngôn ngữ:** [TypeScript](https://www.typescriptlang.org/)
- **Dịch vụ Backend:** [PocketBase](https://pocketbase.io/)
- **Styling:** CSS thuần với các tính năng hiện đại (biến, animations, media queries).
- **Web Server (Production):** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)

## 🚀 Hướng Dẫn Cài Đặt

Làm theo các bước dưới đây để cài đặt và chạy dự án trên máy của bạn.

### Yêu cầu

- [Node.js](https://nodejs.org/) (phiên bản 18.x trở lên)
- [npm](https://www.npmjs.com/) hoặc [yarn](https://yarnpkg.com/)

### Chạy trên máy cá nhân (Local Development)

1.  **Clone repository về máy:**
    ```bash
    git clone https://github.com/hoainghia22/prompt-library.git
    cd prompt-library
    ```

2.  **Cài đặt các gói phụ thuộc:**
    ```bash
    npm install
    ```

3.  **Khởi động server development:**
    ```bash
    npm run dev
    ```
    Ứng dụng sẽ chạy tại địa chỉ `http://localhost:5173`. Server hỗ trợ Hot Module Replacement (HMR) giúp tăng tốc quá trình phát triển.

## 🐳 Triển Khai

Ứng dụng đã được tối ưu để triển khai như một ứng dụng Node.js.

### Chạy Production Build trên máy cá nhân

Bạn có thể giả lập môi trường production ngay trên máy của mình.

1.  **Build ứng dụng:**
    Lệnh này sẽ biên dịch mã nguồn TypeScript và đóng gói tài nguyên vào thư mục `dist`.
    ```bash
    npm run build
    ```

2.  **Khởi động máy chủ production:**
    Lệnh này sẽ chạy máy chủ Express (`server.js`) để phục vụ các tệp tĩnh từ thư mục `dist`.
    ```bash
    npm start
    ```
    Ứng dụng sẽ chạy tại địa chỉ `http://localhost:8080`.

### Triển Khai với Docker

Dự án sử dụng một **Dockerfile đa tầng (multi-stage build)** để tạo ra một image production nhỏ gọn và an toàn.

-   **Giai đoạn 1 (Build):** Build ứng dụng React bằng Vite để tạo ra các tệp tĩnh.
-   **Giai đoạn 2 (Production):** Tạo một image Node.js gọn nhẹ, chỉ sao chép các tệp đã build (`dist`), máy chủ Express (`server.js`), và các `dependencies` cần thiết để chạy ứng dụng.

#### Yêu cầu

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

#### Chạy với Docker

1.  **Build Docker image:**
    ```bash
    docker-compose build
    ```

2.  **Chạy container:**
    Lệnh này sẽ khởi động container ở chế độ detached mode.
    ```bash
    docker-compose up -d
    ```
    Ứng dụng sẽ chạy tại địa chỉ **`http://localhost:8000`**.

#### Dừng container

Để dừng container đang chạy, sử dụng lệnh:
```bash
docker-compose down
```

## ⚙️ Cấu Hình

URL của PocketBase backend được cấu hình trong file `src/index.tsx`. Nếu bạn muốn kết nối đến một instance khác, hãy thay đổi hằng số sau:

```typescript
// src/index.tsx
const POCKETBASE_URL = 'https://api.cafenho.site';
```
