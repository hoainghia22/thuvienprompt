# server.js

Đây là một máy chủ web đơn giản sử dụng Express, được thiết kế để phục vụ ứng dụng React đã được build cho môi trường production.

-   Nó sử dụng `express.static` để phục vụ các tệp tĩnh (HTML, CSS, JS, hình ảnh) từ thư mục `dist`.
-   Nó có một route `app.get('*', ...)` để bắt tất cả các yêu cầu khác và trả về `index.html`. Điều này rất quan trọng để client-side routing (ví dụ: React Router) có thể hoạt động đúng cách; máy chủ luôn trả về trang chính và React sẽ xử lý việc hiển thị component tương ứng với URL.

```javascript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module-friendly __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving the index.html
// This is important for client-side routing in single-page applications
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
```
