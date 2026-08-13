# Automated Model Retraining Pipeline (Updated)

Dựa trên thông tin bạn cung cấp, vì bạn sử dụng **n8n** để kéo dữ liệu và lưu thẳng vào **PostgreSQL**, đồng thời chưa có hệ thống đánh giá mô hình, luồng thực thi (pipeline) của chúng ta sẽ được đơn giản hoá và tối ưu theo kiến trúc Event-Driven (hướng sự kiện).

## Bối cảnh cập nhật
- **Dữ liệu**: Kéo bởi `n8n` mỗi 6 giờ và lưu thẳng vào database PostgreSQL.
- **Trigger**: n8n có thể dễ dàng gọi HTTP Webhook.
- **Đánh giá**: Tạm thời chưa có metrics, mô hình mới cứ train xong là thay thế mô hình cũ luôn.

## Đề xuất Luồng Thực thi Tự động mới

### 1. N8N Webhook Trigger
Khi n8n chạy xong luồng lấy data và insert vào PostgreSQL, bạn thêm 1 Node `HTTP Request` cuối cùng trong luồng n8n để gọi tới API của backend:
- `POST /api/v1/ml/retrain`

### 2. FastAPI Xử lý Bất đồng bộ (Background Task)
Khi API `/retrain` được n8n gọi:
- FastAPI sẽ lập tức trả về response `{"message": "Retraining started"}` để n8n hoàn tất luồng (không bị timeout).
- Việc huấn luyện (retrain) sẽ được đẩy xuống chạy ngầm (sử dụng `BackgroundTasks` tích hợp sẵn của FastAPI).

### 3. Huấn luyện trực tiếp từ PostgreSQL
Hàm `train_model` thay vì đọc từ file CSV (như script hiện tại) sẽ được viết lại để:
- Kết nối vào PostgreSQL (sử dụng session SQLAlchemy có sẵn).
- Query dữ liệu giá chứng khoán (`pandas.read_sql`).
- Huấn luyện mô hình (không cần bước đánh giá).
- Ghi đè file `app/ml/models/best_model.pt`.

### 4. Hot-Reload Mô hình trên FastAPI
Ngay sau khi file `best_model.pt` được cập nhật, tiến trình ngầm sẽ tự động gọi hàm `prediction_service.load_model()`. 
Mô hình trên RAM của FastAPI sẽ được cập nhật mới nhất, các request `/predict` tiếp theo sẽ lập tức được chạy trên model mới mà không cần restart server.

## Các thay đổi cụ thể trên Source Code (Proposed Changes)

### Tích hợp Database vào quá trình Train
#### [MODIFY] [app/ml/training/train.py](file:///d:/SIC_Big_Data/SIC-BTL/stock-predictor-backend/app/ml/training/train.py)
- Thay đổi tham số truyền vào từ `data_path` thành kết nối Database.
- Dùng `pandas.read_sql` kết hợp `SessionLocal` để tải dữ liệu huấn luyện.
- Thực hiện lưu model.

### Cập nhật API FastAPI
#### [NEW] [app/api/v1/endpoints/ml.py](file:///d:/SIC_Big_Data/SIC-BTL/stock-predictor-backend/app/api/v1/endpoints/ml.py)
- Tạo endpoint `POST /retrain` nhận trigger từ n8n.
- Sử dụng `fastapi.BackgroundTasks` để gọi hàm `train_model()`.
- Tự động gọi `prediction_service.load_model()` sau khi hàm train xong.

#### [MODIFY] [app/api/v1/router.py](file:///d:/SIC_Big_Data/SIC-BTL/stock-predictor-backend/app/api/v1/router.py)
- Khai báo thêm router mới (ví dụ `/ml`).

#### [MODIFY] [app/services/prediction_service.py](file:///d:/SIC_Big_Data/SIC-BTL/stock-predictor-backend/app/services/prediction_service.py)
- Xác nhận hàm `load_model()` thread-safe để có thể thay model runtime an toàn.

## Verification Plan
1. **Automated / Unit Testing:** Dùng cURL (hoặc Postman) bắn request `POST /api/v1/ml/retrain`. Theo dõi log trên terminal xem tiến trình lấy dữ liệu từ DB, train, và cập nhật model có hoạt động đúng không.
2. **N8N Testing:** Cấu hình node HTTP Request trên n8n và chạy test node để xác thực tính liên thông.
