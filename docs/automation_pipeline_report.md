# Báo Cáo Khảo Sát & Kiểm Thử Luồng Tự Động Hóa (Data Pipeline & MLflow)

Tài liệu này mô tả chi tiết thiết kế, tích hợp, và kết quả kiểm thử của hệ thống pipeline học máy hoàn chỉnh, bao gồm luồng kéo dữ liệu tự động từ nguồn, lưu trữ, và quá trình huấn luyện/đánh giá mô hình quản lý bởi MLflow.

---

## 1. Kiến Trúc Luồng Dữ Liệu & Huấn Luyện (End-to-End Pipeline)

Hệ thống được thiết kế hoàn toàn tự động, kích hoạt định kỳ không cần sự can thiệp của con người, theo chu trình 4 bước:

```mermaid
flowchart TD
    A[n8n Schedule Trigger\n(18:00 Hàng ngày)] --> B[Fetch Data\n(Vietstock API)]
    B --> C[Data Transform\n(Lọc Time, OHLCV)]
    C --> D[PostgreSQL\n(Bảng stock_history)]
    D --> E[FastAPI Webhook\n(POST /api/v1/ml/retrain)]
    E --> F[Train XGBoost\n(Time-based split 80/20)]
    F --> G[MLflow Tracking\n(Log Parameters & Metrics)]
    G --> H{Champion vs Challenger\n(So sánh F1-Score)}
    H -->|Challenger Thắng| I[Ghi đè best_model.json\nHot-Reload vào RAM]
    H -->|Challenger Thua| J[Reject Challenger\nGiữ nguyên mô hình hiện tại]
```

### Chi tiết các Node trên n8n (`n8n_scrambleflow.json`):
1. **Schedule Trigger**: Kích hoạt vào 18:00 hàng ngày (sau giờ giao dịch).
2. **Map stockID**: Duyệt qua danh sách các mã cổ phiếu VN30.
3. **HTTP Request (Vietstock)**: Gửi request lấy dữ liệu thống kê giá.
4. **Data Transformation (Code node)**: Định dạng ngày tháng, làm sạch và chuẩn hóa dữ liệu OHLCV.
5. **Postgres (Upsert)**: Cập nhật hoặc thêm mới dữ liệu vào bảng `stock_history`.
6. **Trigger Retrain (MỚI THÊM)**: Node HTTP Request gọi đến `POST http://<api-host>:8000/api/v1/ml/retrain` để báo cho hệ thống backend biết dữ liệu mới đã sẵn sàng.

---

## 2. Luồng Huấn Luyện & Đánh Giá Tự Động (MLflow)

Sau khi n8n gọi Webhook `/api/v1/ml/retrain`, quá trình sau diễn ra dưới dạng Background Task (không làm treo request của n8n):

1. **Chuẩn bị dữ liệu**: Đọc dữ liệu từ `stock_history`, tính toán Feature Kỹ thuật (RSI, MACD, Volume Ratio, v.v.).
2. **Time-based Split**: Chia dữ liệu theo thời gian (80% cũ train, 20% mới test) chống rò rỉ dữ liệu tương lai.
3. **MLflow Tracking**: 
   - Sử dụng `sqlite:///mlflow.db` làm backend store, đảm bảo dữ liệu không bị lỗi đồng bộ file system.
   - Ghi lại số lượng sample, siêu tham số thuật toán (n_estimators, max_depth).
4. **Champion vs Challenger**:
   - Mô hình mới (**Challenger**) được train và dự đoán trên tập 20% dữ liệu mới nhất.
   - Mô hình cũ đang chạy (**Champion**) được dự đoán trên **cùng** tập 20% đó.
   - So sánh dựa trên **F1-Score**.
5. **Ra Quyết Định**:
   - Nếu *Promoted*: Ghi đè `best_model.json` và service tự động `load_model()` lại lên RAM.
   - Nếu *Rejected*: Bỏ qua mô hình mới, hệ thống vẫn duy trì sự ổn định.

---

## 3. Kết Quả Kiểm Thử (Verification)

Quá trình kiểm thử luồng (bao gồm cả test giả lập n8n call backend) cho kết quả chính xác:

### a. Kiểm thử Webhook từ n8n
- **Endpoint**: `POST /api/v1/ml/retrain`
- **Kết quả**: Trả về HTTP `202 Accepted` ngay lập tức, tránh việc n8n bị timeout khi chờ đợi.
- **Log Backend**:
  ```text
  [INFO] === [ML PIPELINE] Starting background model retraining & evaluation ===
  [INFO] Dataset split: Train = 6270 samples, Test = 1590 samples.
  ```

### b. Kiểm thử Đánh giá MLflow
- Việc lưu trữ metric và quyết định so sánh diễn ra hoàn hảo:
  ```text
  [INFO] Challenger Test Metrics: {'accuracy': 0.6377, 'precision': 0.6498, 'recall': 0.7061, 'f1_score': 0.6768}
  [INFO] Champion Test Metrics: {'accuracy': 0.6931, 'precision': 0.686, 'recall': 0.7904, 'f1_score': 0.7345}
  [INFO] Decision -> Promoted: False | Reason: Champion maintained superior performance on f1_score: Champion (0.7345) > Challenger (0.6768). Challenger rejected.
  ```

### c. Kiểm thử Giao Diện MLflow
- UI Dashboard (`http://localhost:5000`) khởi chạy thành công.
- Lịch sử API `GET /api/v1/ml/evaluation-history` trả về đầy đủ định dạng chuẩn.
- Các tag quyết định (`PROMOTED` / `REJECTED`) được gắn nhãn minh bạch trên từng run của MLflow.

---

## 4. Tóm Lược
Luồng kéo dữ liệu (n8n) và luồng ML (FastAPI + MLflow) đã được **kết nối thành công hoàn toàn**. Bất cứ khi nào n8n cập nhật dữ liệu hàng ngày vào CSDL, hệ thống AI sẽ tự động rèn luyện lại kiến thức và đưa ra quyết định có nên tự cập nhật não bộ của mình (hot-reload) để phục vụ cho phiên giao dịch ngày mai hay không, mà không cần dev can thiệp.
