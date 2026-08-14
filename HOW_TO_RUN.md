# 🚀 HƯỚNG DẪN KHỞI CHẠY DỰ ÁN (HOW TO RUN)
## VN30 Alpha Stock Predictor & BigData Analytics System

Tài liệu này tóm tắt toàn bộ quy trình thiết lập và khởi chạy 4 thành phần của dự án một cách nhanh chóng, chuẩn xác nhất.

---

## 📌 1. Bảng Thông Tin Các Dịch Vụ & Port

| Dịch Vụ | Công Nghệ | Địa Chỉ Truy Cập (URL) | Mục Đích |
| :--- | :--- | :--- | :--- |
| **Backend API** | FastAPI, Uvicorn | [http://localhost:8000/docs](http://localhost:8000/docs) | REST API, WebSocket nháy giá, Machine Learning Engine |
| **Frontend Web App** | React 19, Vite, Tailwind | [http://localhost:5173](http://localhost:5173) | Giao diện bảng giá VN30, biểu đồ TradingView, AI Predict |
| **MLflow Dashboard** | MLflow 3.x, SQLite | [http://localhost:5000](http://localhost:5000) | Theo dõi các lần train model, Accuracy, F1-Score, Champion/Challenger |
| **Automation Pipeline** | n8n Workflow | [http://localhost:5678](http://localhost:5678) | Kéo giá từ Vietstock hàng ngày lúc 18:00 & trigger retrain |

---

## ⚡ 2. Hướng Dẫn Khởi Chạy Nhanh (Local Development)

Mở **3 hoặc 4 cửa sổ Terminal riêng biệt** để chạy từng dịch vụ:

### 🔹 Bước 1: Khởi chạy Backend FastAPI (Terminal 1)

```powershell
# 1. Di chuyển vào thư mục backend
cd stock-predictor-backend

# 2. Tạo và kích hoạt môi trường ảo
python -m venv venv
.\venv\Scripts\activate

# 3. Cài đặt thư viện (nếu chưa cài)
pip install -r requirements.txt

# 4. Khởi chạy server FastAPI (Bắt buộc dùng --host 0.0.0.0)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
> [!NOTE]
> - Backend đã được cấu hình mặc định sử dụng SQLite cục bộ (`USE_SQLITE=True` trong file `.env`), tự động nạp sẵn 30 mã VN30 và nến lịch sử mà không cần cài đặt PostgreSQL.
> - Swagger API Docs: **http://localhost:8000/docs**

---

### 🔹 Bước 2: Khởi chạy Frontend React Web App (Terminal 2)

```powershell
# 1. Di chuyển vào thư mục frontend
cd vn30-web-app

# 2. Cài đặt gói npm (nếu chưa cài)
npm install

# 3. Khởi chạy máy chủ Vite
npm run dev
```
> [!TIP]
> - Truy cập giao diện tại: **http://localhost:5173**
> - Bấm nút **"VIP Demo Login"** trên giao diện Login để trải nghiệm tài khoản VIP: `investor@vn30alpha.ai` / `password123`.

---

### 🔹 Bước 3: Khởi chạy MLflow Dashboard (Terminal 3)

```powershell
# 1. Di chuyển vào thư mục backend
cd stock-predictor-backend

# 2. Kích hoạt môi trường ảo
.\venv\Scripts\activate

# 3. Khởi chạy MLflow với cờ --workers 1 (Chuẩn trên Windows)
mlflow ui --backend-store-uri sqlite:///mlflow.db --port 5000 --workers 1
```
> [!NOTE]
> - Truy cập bảng điều khiển mô hình tại: **http://localhost:5000**
> - Cờ `--workers 1` giúp tránh lỗi socket đa tiến trình trên hệ điều hành Windows.

---

### 🔹 Bước 4: Khởi chạy Luồng n8n Tự Động Hóa (Terminal 4 - Tùy chọn)

```powershell
# Khởi chạy n8n
npx n8n
```
1. Truy cập: **http://localhost:5678**
2. Nhấn **Workflows** > **Add workflow** > Menu **(...)** ở góc phải trên > Chọn **Import from file**.
3. Chọn file `stock-predictor-backend/n8n_scrambleflow.json`.
4. Cấu hình Node cuối cùng **"Kích hoạt Retrain Model"**:
   - Nếu chạy n8n bằng `npx n8n`: URL là `http://localhost:8000/api/v1/ml/retrain`
   - Nếu chạy n8n bằng Docker: URL là `http://host.docker.internal:8000/api/v1/ml/retrain`
   - Đảm bảo trong tab **Settings** của node đã bật **"Execute Once"**.
5. Bấm **"Test workflow"** để kiểm tra cào dữ liệu và kích hoạt retrain tự động.

---

## 🧪 3. Cách Kiểm Thử Toàn Trình (End-to-End Testing)

1. **Xem Bảng Giá & Nến Kỹ Thuật**: Mở [http://localhost:5173](http://localhost:5173), click vào mã `FPT`, `HPG`, `TCB` xem biểu đồ nến TradingView, các chỉ báo RSI, MACD, Bollinger Bands.
2. **Xem Phân Tích AI**: Bấm nút **"Phân Tích AI Sâu"** tại trang chi tiết mã để xem báo cáo dự báo phiên tiếp theo.
3. **Kích Hoạt Re-train Mô Hình Thủ Công**:
   - Truy cập Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Tìm endpoint `POST /api/v1/ml/retrain-sync` > Bấm **Try it out** > **Execute**.
   - Quan sát Terminal Backend: Hệ thống sẽ tự động tính toán đặc trưng kỹ thuật, huấn luyện mô hình XGBoost Challenger, so sánh F1-Score với Champion và hot-reload vào RAM.
   - Mở [http://localhost:5000](http://localhost:5000) (MLflow) để xem run mới cùng nhãn `PROMOTED` hoặc `REJECTED`.

---

## ❓ 4. Xử Lý Các Lỗi Thường Gặp (Troubleshooting)

| Lỗi Gặp Phải | Nguyên Nhân | Cách Khắc Phục |
| :--- | :--- | :--- |
| `Connection refused at localhost:5432` | Máy chưa bật PostgreSQL | Kiểm tra file `.env` đã có dòng `USE_SQLITE=True` để dùng SQLite miễn phí zero-config. |
| `OSError: [WinError 10022] socket` | MLflow sinh 4 workers trên Windows | Luôn thêm cờ `--workers 1` khi chạy lệnh MLflow UI. |
| `n8n ECONNREFUSED host.docker.internal` | FastAPI chưa mở cho Docker kết nối | Khởi động Backend bằng `uvicorn ... --host 0.0.0.0 --port 8000`. |
| `n8n gọi retrain lặp lại 214 lần` | Node HTTP Request chạy theo từng dòng | Vào tab **Settings** của Node HTTP Request trên n8n và bật **Execute Once**. |
