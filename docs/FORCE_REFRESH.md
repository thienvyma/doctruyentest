# Hướng dẫn Force Refresh hoàn toàn

## Vấn đề
Browser và Service Worker đang cache mạnh mẽ, dù đã xóa file vẫn hiển thị nội dung cũ.

## Giải pháp đã áp dụng

### 1. Backend - No Cache Headers
- Tất cả HTML, JS, CSS files đều có headers: `no-cache, no-store, must-revalidate`
- Backend không cache static files

### 2. Service Worker
- Cache name đổi thành `v4` (force refresh)
- HTML, JS, CSS files KHÔNG được cache (luôn fetch từ network)
- Chỉ cache images, fonts, etc.

### 3. HTML - Cache Busting
- Tất cả files có `?v=4.0` để force reload
- Meta tags chống cache

## Cách xóa cache hoàn toàn

### Bước 1: Unregister Service Worker
1. Mở DevTools (F12)
2. Tab **Application** → **Service Workers**
3. Click **Unregister** cho tất cả workers
4. Reload trang

### Bước 2: Clear Cache Storage
1. DevTools → **Application** → **Cache Storage**
2. Right-click → **Delete** cho tất cả cache có tên `novel-reader-*`
3. Reload trang

### Bước 3: Clear Browser Cache
1. DevTools → **Application** → **Storage**
2. Click **Clear site data**
3. Hoặc: Right-click Refresh button → **Empty Cache and Hard Reload**

### Bước 4: Disable Cache khi develop
1. DevTools → Tab **Network**
2. Check **Disable cache**
3. Giữ DevTools mở khi test

### Bước 5: Hard Refresh
- **Windows**: `Ctrl + Shift + R` hoặc `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

## Kiểm tra

1. **Network Tab**: Tất cả files phải có status **200** (không phải 304)
2. **Console**: Không có lỗi
3. **Application → Service Workers**: Không có worker nào active
4. **Application → Cache Storage**: Không có cache nào

## Nếu vẫn không được

1. **Restart server**: Dừng và chạy lại `python app.py`
2. **Thử browser khác**: Chrome, Firefox, Edge
3. **Incognito mode**: Mở tab ẩn danh
4. **Clear all browser data**: Settings → Clear browsing data → All time

