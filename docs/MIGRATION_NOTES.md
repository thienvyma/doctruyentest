# Migration Notes - Tái cấu trúc Routing System

## Tổng quan

Dự án đã được tái cấu trúc hoàn toàn với hệ thống routing chuyên nghiệp sử dụng History API.

## Thay đổi chính

### 1. File Structure
- **Cũ**: `webapp/app.js` (monolithic file)
- **Mới**: 
  - `webapp/js/app.js` - Main entry point
  - `webapp/js/router.js` - Router system
  - `webapp/js/pages/` - Page logic (home, novel, reader)
  - `webapp/js/renderers/` - Render functions
  - `webapp/js/utils/` - Utilities
  - `webapp/js/config.js` - Configuration
  - `webapp/js/state.js` - Global state

### 2. File cũ
- `webapp/app.js` → Đã xóa hoàn toàn
- Tất cả code đã được chuyển sang cấu trúc module mới trong `webapp/js/`

### 3. Routing
- **Cũ**: Hash-based (`#novel/123`)
- **Mới**: History API (`/novel/123`)
- URL thay đổi thực sự, hỗ trợ back/forward button

### 4. Routes
- `/` - Trang chủ
- `/novel/:id` - Trang thông tin truyện
- `/novel/:id/chapter/:chapterId` - Trang đọc truyện

## Files đã thay đổi

### Backend
- `backend/app.py` - Đã xóa duplicate code trong `serve_static()`

### Frontend
- `webapp/index.html` - Load `js/app.js` (module system)
- `webapp/service-worker.js` - Cập nhật cache list
- `webapp/app.js` - Đã xóa hoàn toàn, thay bằng `js/app.js`

## Files mới

1. `webapp/js/router.js` - Router system
2. `webapp/js/app.js` - Main entry point
3. `webapp/js/config.js` - Configuration
4. `webapp/js/state.js` - Global state
5. `webapp/js/pages/home.js` - Home page logic
6. `webapp/js/pages/novel.js` - Novel page logic
7. `webapp/js/pages/reader.js` - Reader page logic
8. `webapp/js/renderers/home.js` - Home renderers
9. `webapp/js/renderers/novel.js` - Novel renderers
10. `webapp/js/renderers/reader.js` - Reader renderers
11. `webapp/js/utils/ui.js` - UI utilities

## Cách sử dụng

### Navigate
```javascript
import { router } from './router.js';
router.navigate('/novel/123');
```

### Links
```html
<div data-route="/novel/123">Click me</div>
```

## Lưu ý

- Auth và UserFeatures vẫn sử dụng global scope (sẽ convert sau)
- Tất cả navigation dùng `router.navigate()` thay vì hash
- Backend đã hỗ trợ SPA routing (fallback về index.html)

