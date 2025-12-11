# Novel Reader Webapp

Webapp hoàn chỉnh để đọc truyện với PWA support, có thể cài đặt như app trên iOS.

## Tính năng

- ✅ Danh sách truyện với tìm kiếm
- ✅ Danh sách chương
- ✅ Màn hình đọc với:
  - Điều chỉnh cỡ chữ
  - Chuyển chương trước/sau
  - Dark mode
  - Scroll mượt mà
- ✅ PWA support - cài đặt như app trên iOS
- ✅ Responsive design - hoạt động tốt trên mobile
- ✅ Offline support (một phần)

## Cấu trúc

```
webapp/
├── index.html          # Main HTML
├── styles.css          # Styles
├── app.js             # JavaScript logic
├── service-worker.js  # PWA service worker
├── manifest.json      # PWA manifest
└── icons/            # App icons (cần tạo)
```

## Cài đặt và chạy

### 1. Chạy Backend API

```bash
cd ../backend
python app.py
```

### 2. Chạy Web Server

**Option 1: Python**
```bash
python -m http.server 8080
```

**Option 2: Node.js**
```bash
npx http-server -p 8080 -c-1
```

**Option 3: PHP**
```bash
php -S localhost:8080
```

### 3. Truy cập

- Local: `http://localhost:8080`
- Network: `http://[your-ip]:8080`

## Cấu hình

### Thay đổi API URL

Mở `app.js` và sửa:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Thành IP của máy chạy backend:
```javascript
const API_BASE_URL = 'http://192.168.1.100:5000/api';
```

## Tạo Icons

1. Tạo thư mục `icons/`
2. Tạo các file icon với kích thước:
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
3. Hoặc sử dụng tool online như:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator

## Cài đặt trên iOS

Xem file `HUONG_DAN_CAI_DAT.md` để biết chi tiết.

Tóm tắt:
1. Mở Safari trên iPhone
2. Truy cập webapp
3. Share → Add to Home Screen
4. Sử dụng như app thật!

## Build IPA (Tương lai)

Có thể chuyển đổi webapp thành IPA bằng:
- Capacitor
- React Native
- Flutter
- Expo

Xem `HUONG_DAN_CAI_DAT.md` để biết chi tiết.

