# Cấu trúc Routing Mới

## Tổng quan

Dự án đã được tái cấu trúc với hệ thống routing chuyên nghiệp sử dụng History API thay vì hash-based navigation.

## Cấu trúc thư mục

```
webapp/
├── js/
│   ├── router.js          # Router system
│   ├── config.js          # Configuration
│   ├── state.js           # Global state
│   ├── app.js             # Main entry point
│   ├── pages/
│   │   ├── home.js        # Home page logic
│   │   ├── novel.js       # Novel detail page logic
│   │   └── reader.js      # Reader page logic
│   ├── renderers/
│   │   ├── home.js        # Home page renderers
│   │   ├── novel.js       # Novel page renderers
│   │   └── reader.js      # Reader page renderers
│   └── utils/
│       └── ui.js          # UI utilities
├── index.html
└── ...
```

## Routes

1. **`/`** - Trang chủ (Home)
   - Hiển thị danh sách tất cả truyện
   - Handler: `initHomePage()`

2. **`/novel/:id`** - Trang thông tin truyện (Novel Detail)
   - Hiển thị thông tin truyện và danh sách chương
   - Handler: `initNovelPage({ id })`

3. **`/novel/:id/chapter/:chapterId`** - Trang đọc truyện (Reader)
   - Hiển thị nội dung chương
   - Handler: `initReaderPage({ id, chapterId })`

## Cách sử dụng Router

### Navigate to route
```javascript
import { router } from './router.js';

// Navigate to home
router.navigate('/');

// Navigate to novel
router.navigate('/novel/thieu-gia-bi-bo-roi');

// Navigate to chapter
router.navigate('/novel/thieu-gia-bi-bo-roi/chapter/1');
```

### Replace route (không tạo history entry)
```javascript
router.replace('/novel/123');
```

### Register new route
```javascript
router.register('/custom/:param', async (params) => {
    console.log('Custom route:', params);
});
```

## Backend Routing

Backend đã được cấu hình để hỗ trợ SPA routing:
- Tất cả routes không phải API sẽ fallback về `index.html`
- Frontend router sẽ xử lý routing

## Migration Notes

- Các file cũ (`app.js` ở root) vẫn tồn tại nhưng không được sử dụng
- Auth và UserFeatures vẫn sử dụng global scope (sẽ convert sang modules sau)
- Tất cả navigation giờ sử dụng `router.navigate()` thay vì `window.location.hash`

