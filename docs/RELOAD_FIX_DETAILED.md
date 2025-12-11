# Sửa lỗi reload trang - Chi tiết đầy đủ

## Vấn đề

Khi reload trang ở các URL như:
- `/novel/Thiếu%20Gia%20Bị%20Bỏ%20Rơi`
- `/novel/Thiếu%20Gia%20Bị%20Bỏ%20Rơi/chapter/1`

Trang hiển thị trống, không có nội dung, các nút không hoạt động.

## Nguyên nhân

1. **Backend**: Đã serve `index.html` đúng (404 handler catch)
2. **Frontend Router**: Không decode URL-encoded paths đúng cách
3. **API Calls**: Không encode novelId/chapterId khi fetch API
4. **Error Handling**: Không hiển thị lỗi rõ ràng khi có vấn đề

## Đã sửa

### 1. Router - URL Decoding

**File**: `webapp/js/router.js`

- ✅ Decode URL-encoded path parts trong `matchRoute()`
- ✅ Thêm logging chi tiết để debug
- ✅ Hiển thị routes đã đăng ký và params match được

**Thay đổi**:
```javascript
// Decode URL-encoded path parts
const pathParts = path.split('/').filter(p => p).map(p => {
    try {
        return decodeURIComponent(p);
    } catch (e) {
        return p; // If decoding fails, use original
    }
});
```

### 2. Reader Page - Error Handling

**File**: `webapp/js/pages/reader.js`

- ✅ Thêm try-catch trong `initReaderPage()`
- ✅ Encode novelId và chapterId khi fetch API
- ✅ Hiển thị error message rõ ràng nếu có lỗi
- ✅ Thêm logging chi tiết để trace flow

**Thay đổi**:
```javascript
// Encode for URL
const encodedNovelId = encodeURIComponent(novelId);
const encodedChapterId = encodeURIComponent(chapterIdStr);
const url = `${API_BASE_URL}/novels/${encodedNovelId}/chapters/${encodedChapterId}`;
```

### 3. Backend - 404 Handler

**File**: `backend/app.py`

- ✅ Thêm `@app.errorhandler(404)` để catch tất cả 404
- ✅ Serve `index.html` cho SPA routes
- ✅ Block API và admin routes đúng cách

## Cách test

### 1. Restart server
```bash
python app.py
```

### 2. Test reload trang

1. **Mở trang chủ:**
   - `http://localhost:5000`
   - Phải hiển thị danh sách truyện

2. **Click vào truyện:**
   - URL thay đổi thành `/novel/Thiếu%20Gia%20Bị%20Bỏ%20Rơi`
   - Phải hiển thị danh sách chương

3. **Click vào chương:**
   - URL thay đổi thành `/novel/Thiếu%20Gia%20Bị%20Bỏ%20Rơi/chapter/1`
   - Phải hiển thị nội dung chương

4. **Reload trang (F5):**
   - Phải vẫn hiển thị đúng nội dung
   - Không bị trống hoặc 404

5. **Test direct URL:**
   - Mở trực tiếp: `http://localhost:5000/novel/Thiếu%20Gia%20Bị%20Bỏ%20Rơi/chapter/1`
   - Phải load đúng trang

## Debug

### Kiểm tra Console (F12)

**Khi reload trang, phải thấy:**

1. **Router logs:**
   ```
   Router: Handling route /novel/Thiếu Gia Bị Bỏ Rơi/chapter/1
   Router: Available routes: ['/', '/novel/:id', '/novel/:id/chapter/:chapterId']
   Router: Matched pattern /novel/:id/chapter/:chapterId with params {id: "Thiếu Gia Bị Bỏ Rơi", chapterId: "1"}
   ```

2. **Reader logs:**
   ```
   Reader: Initializing reader page {id: "Thiếu Gia Bị Bỏ Rơi", chapterId: "1"}
   Reader: Novel ID: Thiếu Gia Bị Bỏ Rơi Chapter ID: 1
   Reader: Fetching novel detail from: http://localhost:5000/api/novels/Thi%E1%BA%BFu%20Gia%20B%E1%BB%8B%20B%E1%BB%8F%20R%C6%A1i
   Reader: Novel detail loaded: Thiếu Gia Bị Bỏ Rơi
   Reader: Fetching chapter content from: http://localhost:5000/api/novels/.../chapters/1
   ```

3. **Nếu có lỗi:**
   - Sẽ thấy error message rõ ràng
   - Error state được hiển thị trong reader view

### Kiểm tra Network tab

1. **Request `/novel/...`:**
   - Status: `200 OK`
   - Response: HTML (index.html)
   - Headers: `Cache-Control: no-cache...`

2. **API requests:**
   - `/api/novels/...`: `200 OK`
   - `/api/novels/.../chapters/...`: `200 OK`

### Kiểm tra Server logs

Phải thấy:
```
[DEBUG] 404 handler called for path: /novel/Thiếu Gia Bị Bỏ Rơi/chapter/1
[DEBUG] Serving index.html for SPA route (404 handler): /novel/Thiếu Gia Bị Bỏ Rơi/chapter/1
```

## Troubleshooting

### Trang vẫn trống sau reload

1. **Kiểm tra Console:**
   - Có lỗi JavaScript không?
   - Router có match được route không?
   - API calls có thành công không?

2. **Kiểm tra Network:**
   - Request `/novel/...` có trả về `200 OK` không?
   - Response có phải HTML không?
   - API requests có thành công không?

3. **Kiểm tra Server logs:**
   - 404 handler có được gọi không?
   - Có lỗi gì trong server không?

### Router không match route

1. **Kiểm tra Console:**
   - `Router: Available routes:` có hiển thị đúng routes không?
   - `Router: No route matched for` có xuất hiện không?

2. **Kiểm tra URL:**
   - URL có đúng format không?
   - Có ký tự đặc biệt không được encode không?

### API calls thất bại

1. **Kiểm tra Network tab:**
   - Request URL có đúng không?
   - Response status code là gì?
   - Response body có gì?

2. **Kiểm tra Console:**
   - Có error message không?
   - Novel ID và Chapter ID có đúng không?

## Lưu ý

- **URL Encoding**: Novel ID và Chapter ID được encode khi fetch API
- **URL Decoding**: Router decode paths để match routes
- **Error Handling**: Tất cả errors được catch và hiển thị rõ ràng
- **Logging**: Chi tiết logging để dễ debug

