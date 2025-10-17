# tsconfig.node.json

Tệp này là một phần của cấu hình TypeScript, được thiết kế riêng cho các tệp chạy trong môi trường Node.js trong quá trình build, ví dụ như `vite.config.ts`.

-   Nó đảm bảo rằng các tệp cấu hình này được kiểm tra kiểu với các quy tắc phù hợp cho môi trường Node.js, khác với mã nguồn của ứng dụng chạy trên trình duyệt.
-   `"composite": true`: Cho phép tệp cấu hình này được tham chiếu bởi một tệp `tsconfig.json` khác (như trong dự án này).
-   `"moduleResolution": "bundler"`: Tương tự như tệp chính, sử dụng chiến lược phân giải module hiện đại.
-   `"include": ["vite.config.ts"]`: Chỉ áp dụng cấu hình này cho tệp `vite.config.ts`.

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```
