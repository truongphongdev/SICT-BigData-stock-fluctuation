# Stock Predictor FastAPI Backend

This is a FastAPI backend for a Stock Prediction application with integrated AI/ML models.

## Project Structure

```text
stock-predictor/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── logging.py
│   │   └── security.py
│   ├── api/
│   │   ├── deps.py
│   │   └── v1/
│   │       ├── router.py
│   │       └── endpoints/
│   │           ├── predict.py
│   │           ├── stocks.py
│   │           └── health.py
│   ├── schemas/
│   │   ├── stock.py
│   │   └── prediction.py
│   ├── models/
│   │   └── stock.py
│   ├── services/
│   │   ├── prediction_service.py
│   │   └── stock_service.py
│   ├── ml/
│   │   ├── models/            (contains model weights .pt/.pkl)
│   │   ├── inference/
│   │   │   ├── predictor.py
│   │   │   └── preprocessing.py
│   │   ├── training/
│   │   │   ├── train.py
│   │   │   ├── dataset.py
│   │   │   └── evaluate.py
│   │   └── registry.py
│   ├── db/
│   │   ├── session.py
│   │   └── base.py
│   └── utils/
│       └── datetime_utils.py
├── scripts/
│   └── retrain_model.py
├── notebooks/
│   └── explore_data.ipynb
├── alembic/
├── .env.example
├── .gitignore
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Setup and Running

### Prerequisites
- Python 3.11+
- PostgreSQL database (or Docker installed)

### Running Locally

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Copy the environment variables template and configure it:
   ```bash
   cp .env.example .env
   ```

3. Run the FastAPI application using Uvicorn:
   ```bash
   uvicorn app.main:app --reload
   ```

### Running with Docker Compose

To start both the FastAPI application and the PostgreSQL database in containers:
```bash
docker-compose up --build
```
The API will be available at `http://localhost:8000`. Swagger documentation can be accessed at `http://localhost:8000/docs`.
