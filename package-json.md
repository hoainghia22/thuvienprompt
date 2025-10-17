# package.json

Đây là tệp kê khai (manifest) cho dự án Node.js. Nó chứa các thông tin metadata về dự án và quản lý các gói phụ thuộc cũng như các kịch bản (scripts) để tự động hóa các tác vụ.

-   `"scripts"`: Định nghĩa các lệnh tắt.
    -   `"dev"`: Chạy ứng dụng ở chế độ development với Vite.
    -   `"build"`: Build ứng dụng cho môi trường production.
    -   `"preview"`: Xem trước bản build production trên máy cá nhân.
    -   `"start"`: Chạy máy chủ Express để phục vụ các tệp đã build.
-   `"dependencies"`: Các gói cần thiết để chạy ứng dụng trong môi trường production (ví dụ: `react`, `express`).
-   `"devDependencies"`: Các gói chỉ cần thiết trong quá trình phát triển và build (ví dụ: `vite`, `@types/react`).

```json
{
  "name": "prompt-library",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "pocketbase": "^0.21.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}
```
