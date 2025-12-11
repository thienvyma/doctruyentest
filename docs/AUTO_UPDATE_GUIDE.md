# Hướng dẫn Auto Update System

## Tổng quan

Hệ thống tự động phát hiện và reload khi có thay đổi code, **KHÔNG CẦN** xóa cache thủ công trong DevTools.

## Cách hoạt động

### 1. Auto Versioning
- Backend tự động tạo version dựa trên thời gian sửa đổi file
- Mỗi file có version riêng (dựa trên `mtime`)
- Version được gửi qua header `X-App-Version`

### 2. Auto Update Checker
- `auto-update.js` check version mỗi 2 giây (chỉ trong dev mode)
- Khi phát hiện version mới:
  - Tự động xóa tất cả caches
  - Unregister service workers
  - Reload trang

### 3. Service Worker
- **Dev mode**: Service worker bị disable, không cache gì
- **Production**: Service worker hoạt động bình thường

## Tính năng

✅ **Tự động phát hiện thay đổi** - Không cần refresh thủ công
✅ **Tự động xóa cache** - Không cần vào DevTools
✅ **Tự động reload** - Trang tự động refresh khi có update
✅ **Chỉ hoạt động trong dev** - Không ảnh hưởng production

## Sử dụng

### Tự động
- Chỉ cần lưu file → Hệ thống tự động phát hiện và reload
- Không cần làm gì thêm!

### Manual control (nếu cần)
```javascript
// Check update ngay
window.autoUpdate.check();

// Dừng auto-update
window.autoUpdate.stop();
```

## Logs

Trong Console sẽ thấy:
- `[AutoUpdate] Initializing...`
- `[AutoUpdate] Initial version: 1234567890`
- `[AutoUpdate] New version detected!` (khi có thay đổi)
- `[AutoUpdate] Cleared X caches`
- `[AutoUpdate] Reloading page...`

## Lưu ý

1. **Chỉ hoạt động trên localhost** - Tự động disable trên production
2. **Check mỗi 2 giây** - Có thể điều chỉnh trong `auto-update.js`
3. **Không cache trong dev** - Tất cả files đều fetch từ network

## Troubleshooting

### Auto-update không hoạt động
1. Kiểm tra Console có log `[AutoUpdate] Initializing...` không
2. Kiểm tra `window.location.hostname` có phải `localhost` không
3. Kiểm tra Network tab xem có request HEAD đến `/` không

### Vẫn thấy 304
1. Restart server: `python app.py`
2. Hard refresh: `Ctrl + Shift + R`
3. Kiểm tra Response Headers có `X-App-Version` không

