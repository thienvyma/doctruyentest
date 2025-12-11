# Debug 404 khi reload trang

## Vấn đề

Khi reload trang ở các URL như:
- `/novel/Thiếu%20Gia%20Bị%20Bỏ%20Rơi`
- `/novel/Thiếu%20Gia%20Bị%20Bỏ%20Rơi/chapter/1`

Vẫn bị lỗi 404.

## Đã thêm

1. **URL Decoding**: Decode path trước khi xử lý để handle ký tự đặc biệt (tiếng Việt)
2. **Debug Logging**: Thêm logging chi tiết để trace request

## Cách kiểm tra

1. **Restart server:**
   ```bash
   python app.py
   ```

2. **Test reload:**
   - Mở `http://localhost:5000/novel/Thiếu%20Gia%20Bị%20Bỏ%20Rơi`
   - Reload trang (F5)
   - Xem server logs - phải thấy:
     ```
     [DEBUG] serve_static called with path: novel/Thiếu Gia Bị Bỏ Rơi (decoded)
     [DEBUG] Request path: /novel/Thiếu%20Gia%20Bị%20Bỏ%20Rơi
     [DEBUG] Serving index.html for SPA route: novel/Thiếu Gia Bị Bỏ Rơi
     ```

3. **Nếu vẫn 404:**
   - Kiểm tra server logs xem có log `[DEBUG] serve_static called` không
   - Nếu không có → Route không được gọi → Có route khác đang intercept
   - Nếu có → Kiểm tra logic trong function

## Troubleshooting

### Không thấy log `[DEBUG] serve_static called`
- Có thể có route khác match trước
- Kiểm tra tất cả routes trong `app.py`
- Đảm bảo `/<path:path>` được đặt sau tất cả routes khác

### Thấy log nhưng vẫn 404
- Kiểm tra logic trong `serve_static()`
- Kiểm tra xem `WEBAPP_DIR / 'index.html'` có tồn tại không
- Kiểm tra permissions

### Path có ký tự đặc biệt không được decode
- Kiểm tra `unquote()` có hoạt động không
- Thử manual decode trong browser console

