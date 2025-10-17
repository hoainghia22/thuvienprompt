# tsconfig.json

Tệp này cấu hình trình biên dịch TypeScript (`tsc`) cho mã nguồn chính của ứng dụng (nằm trong thư mục `src`).

-   `"target": "ES2020"`: Biên dịch mã TypeScript sang phiên bản JavaScript ES2020.
-   `"lib"`: Chỉ định các thư viện định nghĩa kiểu có sẵn (ví dụ: `DOM` cho các API của trình duyệt).
-   `"module": "ESNext"`: Sử dụng cú pháp module JavaScript hiện đại.
-   `"moduleResolution": "bundler"`: Chế độ phân giải module được tối ưu cho các bundler hiện đại như Vite.
-   `"jsx": "react-jsx"`: Cho phép sử dụng cú pháp JSX mới của React mà không cần `import React`.
-   `"strict": true`: Bật tất cả các tùy chọn kiểm tra kiểu nghiêm ngặt, giúp đảm bảo chất lượng mã nguồn cao hơn.
-   `"include": ["src"]`: Chỉ định rằng chỉ các tệp trong thư mục `src` mới được biên dịch.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```
