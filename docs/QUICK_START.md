# Quick Start Guide

## Bắt đầu nhanh trong 3 bước

### Bước 1: Cài đặt dependencies

```bash
# Cài đặt Python packages
cd scraper
pip install -r requirements.txt

cd ../backend
pip install -r requirements.txt
```

### Bước 2: Cấu hình và chạy scraper

1. Mở `scraper/config.json`
2. Điền thông tin website và CSS selectors
3. Chạy scraper:
   ```bash
   cd scraper
   python scraper.py
   ```

### Bước 3: Chạy webapp

```bash
cd backend
python app.py
```

Mở browser và truy cập: `http://localhost:5000`

## Cài đặt trên iPhone

1. Tìm IP của máy tính (Windows: `ipconfig`)
2. Trên iPhone Safari, truy cập: `http://[IP]:5000`
3. Share → Add to Home Screen
4. Xong! 🎉

## Troubleshooting

**Webapp không load được:**
- Kiểm tra backend đang chạy
- Kiểm tra port 5000 không bị chặn

**Không có dữ liệu:**
- Chạy scraper trước để có dữ liệu
- Kiểm tra `data/novels/` có file không

**iPhone không kết nối được:**
- Đảm bảo cùng WiFi
- Dùng IP thay vì localhost
- Kiểm tra firewall

