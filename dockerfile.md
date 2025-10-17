# Dockerfile

Tệp `Dockerfile` này sử dụng kỹ thuật **multi-stage build** để tạo ra một Docker image gọn nhẹ và tối ưu cho môi trường production.

-   **Giai đoạn 1 (`builder`):** Sử dụng một image Node.js đầy đủ để cài đặt tất cả dependencies (bao gồm cả `devDependencies`) và build ứng dụng React. Kết quả là một thư mục `dist` chứa các tệp tĩnh đã được tối ưu.
-   **Giai đoạn 2 (Production):** Bắt đầu từ một image Node.js `alpine` gọn nhẹ. Chỉ cài đặt các dependencies cần thiết cho production (`--only=production`), sao chép thư mục `dist` từ giai đoạn `builder`, và thêm tệp `server.js`. Điều này giúp giảm đáng kể kích thước của image cuối cùng.

```dockerfile
# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY server.js .

# Expose the port the server will run on
EXPOSE 8080

# The command to start the application
CMD ["node", "server.js"]
```
