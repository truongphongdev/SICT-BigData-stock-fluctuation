# VN30 Alpha Stock Predictor Backend (FastAPI + ML XGBoost + WebSocket)

Hệ thống Backend & Machine Learning hoàn chỉnh cung cấp dữ liệu phân tích kỹ thuật, dự báo xu hướng AI cho rổ chỉ số VN30 và phục vụ ứng dụng frontend **VN30 Web App**.

---

## 🚀 Tính Năng Chính

1. **Tổng quan thị trường & Bảng giá VN30**:
   - Chỉ số VN30 Index, biến động điểm/%, độ rộng thị trường (Tăng / Tham chiếu / Giảm), thanh khoản.
   - Danh sách đầy đủ 30 mã VN30 (FPT, HPG, TCB, VCB, VIC, SSI, VHM, MWG, VPB, MSN, BID, CTG, MBB, GAS, VNM, ACB, GVR, LPB, STB, HDB, SHB, BCM, VRE, VJC, SAB, VIB, SSB, TPB, PLX, BVH).
   - Lọc theo nhóm ngành, sắp xếp đa tiêu chí và tìm kiếm tức thì.
2. **Biểu đồ nến TradingView & Chỉ báo Kỹ thuật**:
   - Lịch sử nến OHLCV theo khung thời gian (`15M`, `1H`, `1D`, `1W`).
   - Tự động tính toán các chỉ báo kỹ thuật: RSI(14), MACD(12,26,9), Bollinger Bands (20,2), EMA20, EMA50, Ngưỡng Kháng cự & Hỗ trợ.
3. **Mô hình Dự Báo AI & Phân Tích Sâu**:
   - Tích hợp mô hình dự báo xu hướng huấn luyện từ XGBoost.
   - Điểm số độ tin cậy AI (Confidence Score: 0 - 100%), tín hiệu khuyến nghị (MUA MẠNH, MUA, NẮM GIỮ, BÁN), mục tiêu giá phiên tiếp theo.
   - Tự động sinh báo cáo phân tích sâu (AI Summary) bằng tiếng Việt cho từng mã.
4. **Quản Lý Danh Mục Đầu Tư (Portfolio)**:
   - Thêm / Bớt mã cổ phiếu theo dõi trong watchlist cá nhân.
   - Ghi nhận vị thế mua/bán, tính toán lãi/lỗ và tổng vốn hóa rổ.
   - Phân tích sức khỏe danh mục (Portfolio Health Score) và cảnh báo rủi ro từ AI.
5. **Tin Tức & Tâm Lý Thị Trường (Market Sentiment)**:
   - Tin tức tài chính gắn thẻ mã cổ phiếu và phân loại theo ngành.
   - Đánh giá sắc thái tin tức AI (Tích cực, Mua mạnh, Trung tính, Tiêu cực) và Market Sentiment Radar.
6. **Xác Thực & Bảo Mật**:
   - Đăng ký, đăng nhập chuẩn JWT Token và mã hóa mật khẩu `bcrypt`.
   - Hỗ trợ đăng nhập nhanh tài khoản VIP Demo (`investor@vn30alpha.ai` / `password123`).
7. **Realtime WebSocket Feed**:
   - Kênh WebSocket `/api/v1/ws/market` stream nháy giá trực tiếp tới giao diện người dùng.

---

## 📁 Cấu Trúc Thư Mục Backend

```text
stock-predictor-backend/
├── app/
│   ├── main.py                        # Khởi chạy FastAPI, lifespan, tạo bảng, seed data, WebSocket
│   ├── core/
│   │   ├── config.py                  # Cấu hình JWT, CORS, Database (PostgreSQL / SQLite)
│   │   ├── logging.py                 # Logging
│   │   └── security.py                # Mã hóa bcrypt và sinh JWT Token
│   ├── api/
│   │   ├── deps.py                    # Dependency DB session & xác thực get_current_user
│   │   └── v1/
│   │       ├── router.py              # Root router API v1
│   │       └── endpoints/
│   │           ├── auth.py            # POST /register, POST /login, POST /demo-login, GET /me
│   │           ├── stocks.py          # GET /stocks, GET /stocks/{symbol}, /history, /indicators
│   │           ├── market.py          # GET /market/overview (VN30 Index, độ rộng thị trường)
│   │           ├── predict.py         # GET /predict/{symbol}, /all/signals, /deep-analysis/{symbol}
│   │           ├── portfolio.py       # GET /portfolio, POST /toggle/{symbol}, POST /items
│   │           ├── news.py            # GET /news, GET /news/sentiment-overview
│   │           ├── ws.py              # WebSocket /api/v1/ws/market (Realtime streaming)
│   │           └── health.py          # GET /health
│   ├── models/
│   │   ├── user.py                    # User account model
│   │   ├── stock.py                   # Stock fundamentals & quotes model
│   │   ├── stock_history.py           # Candlestick OHLCV history model
│   │   ├── portfolio.py               # User portfolio positions model
│   │   ├── news.py                    # Financial news & sentiment model
│   │   └── prediction.py              # AI Prediction logs model
│   ├── schemas/
│   │   ├── user.py                    # Pydantic schemas for Auth & Users
│   │   ├── stock.py                   # Pydantic schemas for Stocks, Candles, Indicators
│   │   ├── prediction.py              # Pydantic schemas for AI Predictions & Deep Analysis
│   │   ├── portfolio.py               # Pydantic schemas for Portfolio overview & positions
│   │   └── news.py                    # Pydantic schemas for News & Sentiment Radar
│   ├── services/
│   │   ├── auth_service.py            # Business logic xác thực
│   │   ├── stock_service.py           # Business logic cổ phiếu, nến, indicators
│   │   ├── prediction_service.py      # Business logic dự báo AI & Deep Analysis
│   │   ├── portfolio_service.py       # Business logic danh mục
│   │   └── news_service.py            # Business logic tin tức
│   ├── ml/
│   │   ├── indicators.py              # Tính toán RSI, MACD, Bollinger Bands, EMA, Hỗ trợ/Kháng cự
│   │   ├── inference/
│   │   │   └── predictor.py           # Engine dự báo xu hướng & sinh AI Summary tiếng Việt
│   │   └── models/                    # Thư mục chứa trọng số mô hình
│   └── db/
│       ├── base.py                    # SQLAlchemy Base metadata
│       ├── session.py                 # Quản lý Engine & SessionLocal
│       └── seed_data.py               # Seeder tự động nạp 30 mã VN30, nến lịch sử và tin tức
├── notebooks/
│   └── xgboost_stock_model.ipynb      # Notebook huấn luyện mô hình XGBoost
├── n8n_scrambleflow.json              # Luồng cào dữ liệu Vietstock tự động
├── docker-compose.yml                 # Docker Compose chạy PostgreSQL & FastAPI
├── Dockerfile                         # Dockerfile đóng gói backend
├── requirements.txt                   # Danh sách thư viện Python
└── README.md
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Cách 1: Chạy Cục Bộ (Local Python)

1. Mở terminal tại thư mục `stock-predictor-backend`:
   ```bash
   cd stock-predictor-backend
   ```

2. Tạo và kích hoạt môi trường ảo:
   ```bash
   # Tạo môi trường ảo
   python -m venv venv

   # Kích hoạt trên Windows:
   venv\Scripts\activate

   # Kích hoạt trên Linux/macOS:
   source venv/bin/activate
   ```

3. Cài đặt các thư viện cần thiết:
   ```bash
   pip install -r requirements.txt
   ```

4. Khởi chạy FastAPI Server với Uvicorn:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

*(Lưu ý: Nếu chưa cấu hình PostgreSQL, hệ thống sẽ tự động tạo cơ sở dữ liệu SQLite `stock_predictor.db` và nạp sẵn toàn bộ 30 mã VN30 cùng 90 ngày dữ liệu nến lịch sử và tin tức mẫu).*

---

### Cách 2: Chạy Bằng Docker Compose (Khuyên Dùng Cho Production)

Chỉ cần một lệnh duy nhất để khởi chạy đồng thời cơ sở dữ liệu **PostgreSQL** và **FastAPI API Server**:
```bash
docker-compose up --build
```

---

## 📖 Swagger API Documentation

Khi backend đang chạy, bạn có thể truy cập tài liệu tương tác API tại:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Kiểm tra trạng thái**: [http://localhost:8000/](http://localhost:8000/)

---

## 🌐 Danh Sách REST APIs Chính

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Đăng ký tài khoản mới |
| `POST` | `/api/v1/auth/login` | Đăng nhập lấy JWT Token |
| `POST` | `/api/v1/auth/demo-login` | Đăng nhập siêu tốc tài khoản VIP Demo |
| `GET` | `/api/v1/auth/me` | Lấy thông tin tài khoản hiện tại |
| `GET` | `/api/v1/stocks/` | Lấy danh sách 30 mã VN30 (hỗ trợ filter sector, sort, search) |
| `GET` | `/api/v1/stocks/{symbol}` | Lấy chi tiết thông tin cơ bản của mã |
| `GET` | `/api/v1/stocks/{symbol}/history` | Lấy nến OHLCV theo khung thời gian (`15M`, `1H`, `1D`, `1W`) |
| `GET` | `/api/v1/stocks/{symbol}/indicators` | Lấy RSI, MACD, Bollinger Bands, Kháng cự / Hỗ trợ |
| `GET` | `/api/v1/market/overview` | Tổng quan VN30 Index, độ rộng thị trường, khối lượng |
| `GET` | `/api/v1/predict/{symbol}` | Dự báo AI ngắn hạn & mục tiêu phiên tiếp theo |
| `GET` | `/api/v1/predict/all/signals` | Lấy tín hiệu AI cho toàn bộ rổ VN30 |
| `POST` | `/api/v1/predict/deep-analysis/{symbol}` | Báo cáo phân tích chuyên sâu cho AI Modal |
| `GET` | `/api/v1/portfolio/` | Lấy danh mục đầu tư và đánh giá sức khỏe rổ AI |
| `POST` | `/api/v1/portfolio/toggle/{symbol}` | Bật/tắt theo dõi mã cổ phiếu trong rổ |
| `GET` | `/api/v1/news/` | Lấy tin tức tài chính và phân loại sắc thái AI |
| `GET` | `/api/v1/news/sentiment-overview` | Lấy chỉ số tâm lý thị trường Market Sentiment |
| `WS` | `/api/v1/ws/market` | WebSocket stream nháy giá thời gian thực |
