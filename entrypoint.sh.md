# Kịch bản khởi động (entrypoint.sh)

Dự án hiện tại không sử dụng `entrypoint.sh`, nhưng đây là một kịch bản (script) rất hữu ích trong Docker để thực hiện các tác vụ chuẩn bị trước khi chạy ứng dụng chính. Ví dụ: chờ database sẵn sàng, thực hiện database migration, hoặc thiết lập các cấu hình động.

### Ví dụ về tệp `entrypoint.sh`

Bạn có thể tạo một tệp `entrypoint.sh` ở thư mục gốc với nội dung sau:

```bash
#!/bin/sh
# Thoát ngay lập tức nếu một lệnh trả về lỗi.
set -e

echo "Running entrypoint script..."
# Tại đây bạn có thể thêm các lệnh khác, ví dụ:
# echo "Waiting for database..."
# ./wait-for-it.sh db:5432 -- echo "Database is up"

echo "Starting production server..."

# "exec $@" sẽ thực thi lệnh được truyền vào từ CMD của Dockerfile.
# Việc sử dụng 'exec' sẽ thay thế tiến trình của script bằng tiến trình của ứng dụng,
# giúp tín hiệu (signals) được chuyển tiếp đúng cách.
exec "$@"
```

### Cách sử dụng trong `Dockerfile`

Để sử dụng script này, bạn cần cấp quyền thực thi và gọi nó trong `Dockerfile`:

```dockerfile
# ... (các bước trước đó)

COPY server.js .
# Sao chép và cấp quyền thực thi cho entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8080

# Thiết lập entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Lệnh mặc định sẽ được truyền vào entrypoint
CMD ["node", "server.js"]
```
