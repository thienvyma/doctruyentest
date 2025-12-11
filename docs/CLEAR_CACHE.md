# Hướng dẫn xóa cache để áp dụng thay đổi

## Vấn đề
Service Worker và browser cache có thể đang lưu file index.html cũ.

## Giải pháp

### 1. Xóa Service Worker Cache
1. Mở DevTools (F12)
2. Vào tab **Application** (hoặc **Storage**)
3. Chọn **Service Workers** → Click **Unregister**
4. Chọn **Cache Storage** → Xóa tất cả cache có tên `novel-reader-*`

### 2. Hard Refresh Browser
- **Windows/Linux**: `Ctrl + Shift + R` hoặc `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### 3. Clear Browser Cache
1. Mở DevTools (F12)
2. Right-click vào nút Refresh
3. Chọn **Empty Cache and Hard Reload**

### 4. Disable Cache (khi đang develop)
1. Mở DevTools (F12)
2. Vào tab **Network**
3. Check **Disable cache**
4. Giữ DevTools mở khi test

## Service Worker đã được cập nhật
- Cache name đã đổi từ `v2` → `v3` để force refresh
- `index.html` không còn được cache (luôn fetch từ network)

