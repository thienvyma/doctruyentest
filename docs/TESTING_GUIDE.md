# Testing Guide - Hướng dẫn kiểm tra dự án

## Khởi chạy Server

### Windows (PowerShell)
```powershell
cd backend
python app.py
```

### Linux/Mac
```bash
cd backend
python3 app.py
```

Hoặc sử dụng script có sẵn:
- Windows: `backend\start_server.bat`
- Linux/Mac: `backend\start_server.sh`

## Kiểm tra Server

Sau khi khởi động, server sẽ chạy tại:
- **Webapp**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin
- **API**: http://localhost:5000/api

## Kiểm tra Routes

### 1. Trang chủ
- URL: `http://localhost:5000/`
- Kỳ vọng: Hiển thị danh sách truyện dạng grid
- Kiểm tra:
  - [ ] Trang chủ hiển thị truyện
  - [ ] Click vào truyện → URL đổi thành `/novel/{id}`
  - [ ] Sidebar hiển thị danh sách truyện

### 2. Trang thông tin truyện
- URL: `http://localhost:5000/novel/{novel-id}`
- Kỳ vọng: Hiển thị thông tin truyện và danh sách chương
- Kiểm tra:
  - [ ] Hiển thị đúng thông tin truyện
  - [ ] Danh sách chương hiển thị đầy đủ
  - [ ] Click vào chương → URL đổi thành `/novel/{id}/chapter/{chapterId}`

### 3. Trang đọc truyện
- URL: `http://localhost:5000/novel/{novel-id}/chapter/{chapter-id}`
- Kỳ vọng: Hiển thị nội dung chương
- Kiểm tra:
  - [ ] Nội dung chương hiển thị đúng
  - [ ] Nút "Chương trước" và "Chương sau" hoạt động
  - [ ] Nút ở đầu và cuối trang đều hoạt động
  - [ ] URL thay đổi khi chuyển chương

### 4. Reload và Navigation
- Kiểm tra:
  - [ ] Reload trang → Giữ nguyên route hiện tại (không về trang chủ)
  - [ ] Back button → Quay lại trang trước
  - [ ] Forward button → Đi tới trang sau
  - [ ] Direct URL access → Load đúng trang

## Kiểm tra Console

Mở Developer Tools (F12) và kiểm tra:
- [ ] Không có lỗi JavaScript
- [ ] Router logs hiển thị đúng route
- [ ] API calls thành công (200 OK)

## Troubleshooting

### Lỗi "Cannot find module"
- Đảm bảo đang sử dụng browser hỗ trợ ES6 modules
- Kiểm tra Network tab xem file có được load không

### Lỗi "404 Not Found"
- Kiểm tra backend routing trong `backend/app.py`
- Đảm bảo file tồn tại trong `webapp/js/`

### URL không thay đổi
- Kiểm tra router initialization trong `js/app.js`
- Kiểm tra console logs

### Trang chủ không hiển thị truyện
- Kiểm tra API `/api/novels` có trả về data không
- Kiểm tra `renderHomeNovels()` có được gọi không

