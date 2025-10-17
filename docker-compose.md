# docker-compose.yml

Tệp này được sử dụng để định nghĩa và chạy các ứng dụng Docker đa container một cách dễ dàng. Trong dự án này, nó định nghĩa một dịch vụ duy nhất là `frontend`.

-   `build: .`: Chỉ dẫn Docker Compose build một image từ `Dockerfile` trong thư mục hiện tại.
-   `container_name`: Đặt một tên cụ thể cho container để dễ quản lý.
-   `ports`: Ánh xạ cổng `8000` trên máy host tới cổng `8080` bên trong container (là cổng mà máy chủ Express đang lắng nghe).
-   `restart: unless-stopped`: Tự động khởi động lại container nếu nó bị dừng, trừ khi bạn chủ động dừng nó.
-   `environment`: Định nghĩa các biến môi trường cho container.

```yaml
version: '3.8'

services:
  frontend:
    build: .
    container_name: prompt_library_frontend
    ports:
      - "8000:8080"
    restart: unless-stopped
    environment:
      - PORT=8080
```
