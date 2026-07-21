import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / ".env")

# Database settings
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "postgres")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

# SQLAlchemy Database connection URI
DB_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Ingestion settings
DEFAULT_STOCK_SOURCE = os.getenv("DEFAULT_STOCK_SOURCE", "VCI")

# VN30 — 30 mã vốn hóa lớn nhất sàn HOSE (Index VN30)
DEFAULT_SYMBOLS = [
    # Ngân hàng (10 mã)
    "VCB", "BID", "CTG", "ACB", "TCB",
    "MBB", "VPB", "HDB", "STB", "EIB",
    # Bất động sản & Vingroup (4 mã)
    "VIC", "VHM", "VRE", "KDH",
    # Hàng tiêu dùng & thực phẩm (3 mã)
    "VNM", "MSN", "SAB",
    # Công nghệ & năng lượng (2 mã)
    "FPT", "POW",
    # Vật liệu & công nghiệp (3 mã)
    "HPG", "GAS", "PLX",
    # Chứng khoán (3 mã)
    "SSI", "VCI", "HCM",
    # Bán lẻ (2 mã)
    "MWG", "PNJ",
    # Hàng không & nông nghiệp (2 mã)
    "VJC", "GVR",
    # Bảo hiểm (1 mã)
    "BVH",
]


# Database Table Names
TABLE_SYMBOLS = "stock_symbols"
TABLE_PRICES = "stock_prices"

# n8n Automation Settings
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "")
