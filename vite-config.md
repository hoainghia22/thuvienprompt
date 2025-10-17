# vite.config.ts

Đây là tệp cấu hình cho Vite, công cụ build và server development của dự án.

-   `defineConfig`: Một hàm tiện ích từ Vite giúp cung cấp gợi ý kiểu (type hints) cho đối tượng cấu hình.
-   `plugins: [react()]`: Đây là phần quan trọng nhất, nơi chúng ta thêm các plugin để mở rộng chức năng của Vite. `@vitejs/plugin-react` là plugin chính thức cung cấp các tính năng cần thiết để làm việc với React, chẳng hạn như Hot Module Replacement (HMR) và chuyển đổi JSX.

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
```
