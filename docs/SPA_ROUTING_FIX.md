# Sửa lỗi 404 khi reload trang (SPA Routing)

## Vấn đề

Khi bấm vào truyện để đọc hoặc bấm vào chi tiết chương để đọc, sau đó reload lại trang sẽ bị lỗi 404.

**Nguyên nhân:**
- Frontend sử dụng History API (`pushState`) để navigate
- Khi reload, browser gửi request đến server với path `/novel/...` hoặc `/novel/.../chapter/...`
- Backend không có route để handle các path này → trả về 404

## Giải pháp

### 1. Backend: SPA Fallback

Đã sửa `serve_static()` trong `backend/app.py`:

- **Trước:** Chỉ serve `index.html` nếu file không tồn tại
- **Sau:** Serve `index.html` cho **TẤT CẢ** routes không phải:
  - API routes (`/api/...`)
  - Admin routes (`/admin/...`)
  - Static files thực sự (`.js`, `.css`, images, etc.)

**Logic mới:**
```python
# Chỉ serve static files thực sự (JS, CSS, images, etc.)
if file_path.exists() and file_path.is_file():
    if any(path.endswith(ext) for ext in static_extensions):
        return send_file(...)

# Tất cả các path khác (bao gồm /novel/..., /novel/.../chapter/...)
# → Serve index.html để frontend router xử lý
return send_from_directory(WEBAPP_DIR, 'index.html')
```

### 2. Frontend Router

Frontend router (`webapp/js/router.js`) đã được thiết kế để:
- Handle routes khi page load (`handleRoute()`)
- Handle routes khi navigate (`navigate()`)
- Handle browser back/forward (`popstate` event)

## Cách test

1. **Restart server:**
   ```bash
   python app.py
   ```

2. **Test navigation:**
   - Mở `http://localhost:5000`
   - Bấm vào một truyện → URL thay đổi thành `/novel/...`
   - Bấm vào một chương → URL thay đổi thành `/novel/.../chapter/...`
   - **Reload trang (F5)** → Phải load đúng trang, không bị 404

3. **Test direct URL:**
   - Mở trực tiếp `http://localhost:5000/novel/Thiếu%20Gia%20Bị%20Bỏ%20Rơi`
   - Phải load đúng trang truyện, không bị 404

4. **Test browser back/forward:**
   - Navigate qua nhiều trang
   - Bấm browser back button → Phải quay lại trang trước
   - Bấm browser forward button → Phải đi tới trang sau

## Lưu ý

- **Static files** (JS, CSS, images) vẫn được serve trực tiếp từ server
- **API routes** (`/api/...`) vẫn hoạt động bình thường
- **Admin routes** (`/admin/...`) vẫn hoạt động bình thường
- **Frontend routes** (`/novel/...`, `/novel/.../chapter/...`) được serve `index.html` và frontend router xử lý

## Troubleshooting

### Vẫn bị 404 khi reload

1. **Kiểm tra server logs:**
   - Xem request có đến `serve_static()` không
   - Xem response code là gì

2. **Kiểm tra Network tab:**
   - Request `/novel/...` phải trả về `200 OK`
   - Response phải là HTML (index.html)

3. **Kiểm tra Console:**
   - Router phải log: `Router: Handling route /novel/...`
   - Không có lỗi JavaScript

4. **Clear cache:**
   - Hard refresh: `Ctrl + Shift + R`
   - Clear browser cache

