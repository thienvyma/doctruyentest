# Hướng dẫn cài đặt Webapp trên iOS

## Cách 1: Cài đặt như PWA (Progressive Web App) - Khuyến nghị

### Bước 1: Chạy Backend API
```bash
cd backend
python app.py
```

### Bước 2: Chạy Web Server
Mở terminal trong thư mục `webapp` và chạy:

**Windows:**
```bash
python -m http.server 8080
```

**Hoặc dùng Node.js:**
```bash
npx http-server -p 8080 -c-1
```

### Bước 3: Truy cập trên iPhone

1. **Đảm bảo iPhone và máy tính cùng mạng WiFi**
2. **Tìm IP của máy tính:**
   - Windows: Mở Command Prompt → `ipconfig` → tìm IPv4 Address
   - Ví dụ: `192.168.1.100`
3. **Mở Safari trên iPhone**
4. **Truy cập:** `http://[IP-của-máy-tính]:8080`
   - Ví dụ: `http://192.168.1.100:8080`

### Bước 4: Cài đặt như App

1. **Nhấn nút Share** (hình vuông với mũi tên lên) ở thanh dưới Safari
2. **Cuộn xuống và chọn "Add to Home Screen"**
3. **Đặt tên** (hoặc giữ nguyên "Novel Reader")
4. **Nhấn "Add"**

### Bước 5: Sử dụng

- App sẽ xuất hiện trên Home Screen như một app thật
- Mở app và sử dụng bình thường
- App có thể hoạt động offline một phần (với Service Worker)

## Cách 2: Build IPA file trên Windows (Cho tương lai)

### Option A: Sử dụng React Native + Expo

1. **Cài đặt:**
   ```bash
   npm install -g expo-cli
   npm install -g eas-cli
   ```

2. **Tạo project:**
   ```bash
   npx create-expo-app NovelReaderApp
   ```

3. **Build IPA:**
   ```bash
   eas build --platform ios
   ```

**Lưu ý:** Cần Apple Developer Account ($99/năm)

### Option B: Sử dụng Capacitor (Chuyển đổi Webapp thành Native)

1. **Cài đặt:**
   ```bash
   npm install -g @capacitor/cli
   ```

2. **Trong thư mục webapp:**
   ```bash
   npm init -y
   npm install @capacitor/core @capacitor/cli
   npm install @capacitor/ios
   npx cap init
   npx cap add ios
   ```

3. **Build:**
   - Cần Mac với Xcode để build IPA
   - Hoặc dùng dịch vụ cloud build như Ionic Appflow

### Option C: Sử dụng Flutter

1. **Cài đặt Flutter SDK**
2. **Tạo project Flutter**
3. **Build IPA:**
   ```bash
   flutter build ipa
   ```

**Lưu ý:** Cần Mac hoặc CI/CD service

## Cách 3: Sử dụng AltStore (Nếu có Mac hoặc Windows với AltServer)

1. **Export webapp thành IPA** (cần Mac với Xcode)
2. **Cài AltStore trên iPhone**
3. **Upload IPA qua AltStore**

## Troubleshooting

### Webapp không kết nối được API:
- Kiểm tra backend đang chạy
- Kiểm tra firewall không chặn port 5000
- Đảm bảo iPhone và máy tính cùng WiFi
- Sửa API_BASE_URL trong `app.js` nếu cần

### Không thấy nút "Add to Home Screen":
- Đảm bảo đang dùng Safari (không phải Chrome/Firefox)
- Kiểm tra đã truy cập qua HTTP/HTTPS
- Thử refresh trang

### App không hoạt động offline:
- Service Worker cần HTTPS hoặc localhost
- Kiểm tra Service Worker đã được register chưa
- Xem Console trong Safari Developer Tools

## Lưu ý quan trọng

1. **PWA trên iOS có giới hạn:**
   - Không thể truy cập một số API native
   - Cần internet để load dữ liệu từ API
   - Có thể cache một phần với Service Worker

2. **Để có app native thật sự:**
   - Cần build IPA file
   - Cần Apple Developer Account
   - Có thể cần Mac hoặc dịch vụ cloud build

3. **PWA là giải pháp tốt nhất** nếu:
   - Chỉ cần đọc truyện online
   - Không muốn trả phí Developer Account
   - Muốn cài đặt nhanh, đơn giản

