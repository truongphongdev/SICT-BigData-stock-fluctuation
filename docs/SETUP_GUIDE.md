# Hướng Dẫn Cài Đặt & Chạy Dự Án (Setup Guide)

Tài liệu này hướng dẫn chi tiết cách thiết lập, cấu hình và khởi chạy toàn bộ hệ thống dự án **SICT-BigData-stock-fluctuation** từ đầu sau khi clone về máy, bao gồm: Backend FastAPI, MLflow Dashboard và hệ thống Automation n8n.

---

## 1. Yêu Cầu Hệ Thống (Prerequisites)
Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:
- **Python 3.10+**
- **Node.js 18+** (cần thiết để chạy n8n qua `npx`)
- **PostgreSQL** (cài đặt cục bộ hoặc sử dụng Docker)

---

## 2. Cài Đặt và Khởi Chạy Backend (FastAPI)

Backend là trái tim của hệ thống, xử lý API, Machine Learning và kết nối Database.

**Bước 1: Thiết lập môi trường ảo (Virtual Environment)**
Mở Terminal tại thư mục `stock-predictor-backend`:
```powershell
# Tạo môi trường ảo
python -m venv venv

# Kích hoạt (Windows)
.\venv\Scripts\activate

# (Hoặc nếu dùng Mac/Linux)
source venv/bin/activate
```

**Bước 2: Cài đặt thư viện**
```powershell
pip install -r requirements.txt
```

**Bước 3: Cấu hình file `.env`**
Đảm bảo bạn có file `.env` tại thư mục gốc của backend với nội dung chuẩn:
```ini
APP_ENV=development
DEBUG=True

# Cấu hình Database Postgres (Đổi thông tin user/pass theo máy bạn)
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=stock_predictor
POSTGRES_PORT=5432

# Cấu hình Model & MLflow
MODEL_PATH=app/ml/models/best_model.json
MLFLOW_TRACKING_URI=sqlite:///mlflow.db
MLFLOW_EXPERIMENT_NAME=stock-predictor-vn30
```

**Bước 4: Khởi chạy API Server**
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Truy cập API Docs (Swagger UI): **http://localhost:8000/docs**

---

## 3. Khởi Chạy MLflow Dashboard

MLflow được dùng để theo dõi (track) các lần huấn luyện mô hình và so sánh hiệu suất.
Mở một Terminal **mới** (vẫn kích hoạt `venv` và đứng tại thư mục `stock-predictor-backend`):

```powershell
mlflow ui --backend-store-uri sqlite:///mlflow.db --port 5000 --workers 1
```
- Truy cập MLflow UI: **http://localhost:5000**

---

## 4. Cài Đặt và Cấu Hình n8n (Automation Data Pipeline)

n8n chịu trách nhiệm kéo dữ liệu chứng khoán hàng ngày và báo cho Backend để train lại mô hình.

**Bước 1: Khởi chạy n8n**
Mở một Terminal **mới** và chạy lệnh:
```powershell
npx n8n
```
- Truy cập giao diện n8n: **http://localhost:5678**
- Lần đầu truy cập, bạn sẽ được yêu cầu tạo tài khoản Admin cục bộ.

**Bước 2: Import Workflow (Luồng xử lý)**
1. Tại giao diện n8n, click vào **Workflows** > **Add workflow**.
2. Nhấn vào nút menu **(...)** ở góc phải trên cùng > Chọn **Import from file**.
3. Chọn file `n8n_scrambleflow.json` nằm trong thư mục `stock-predictor-backend`.

**Bước 3: Cấu hình Database Credential cho n8n**
1. Mở luồng vừa import, click đúp vào Node **"Insert or update rows in a table"** (Node màu xanh của Postgres).
2. Ở phần **Credential**, click **Create New** (hoặc edit cái cũ).
3. Nhập thông tin kết nối tới database PostgreSQL của bạn (User, Password, Host, DB Name).
4. Save lại credential.

**Bước 4: Kích hoạt Luồng (Active)**
- Bạn có thể nhấn nút **"Test workflow"** ở dưới cùng màn hình n8n để chạy thử ngay lập tức.
- Hoặc bật công tắc góc phải trên cùng sang trạng thái **"Active"** để luồng tự động chạy vào lúc **18:00 Hàng ngày**.

---

## 5. Quy Trình Hoạt Động (Cách Test End-to-End)

Để đảm bảo mọi thứ hoạt động trơn tru sau khi cài đặt, bạn làm theo các bước test sau:
1. Mở n8n, nhấn **"Test workflow"**.
2. Nhìn flow chạy: Nó sẽ cào dữ liệu Vietstock -> Ghi vào CSDL Postgres -> Node cuối cùng sẽ gửi Webhook tới Backend `POST http://localhost:8000/api/v1/ml/retrain`.
3. Nhìn sang Terminal đang chạy Backend FastAPI, bạn sẽ thấy log hệ thống báo bắt đầu rèn luyện lại mô hình (chia 80/20 train/test).
4. Mở **http://localhost:5000** (MLflow UI), bạn sẽ thấy một bản ghi (run) mới vừa xuất hiện, hiển thị rõ độ chính xác (Accuracy, F1-Score) và quyết định **PROMOTED** hay **REJECTED**.

---
*Hoàn tất cài đặt! Chúc bạn phân tích dữ liệu hiệu quả với VN30 Stock Predictor.*
