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

# Default symbols list to fetch (can be overridden)
DEFAULT_SYMBOLS = [
    "VCB", "ACB", "TCB", "BID", "CTG", # Banks
    "VNM", "FPT", "HPG", "GAS", "MSN", # Large caps
    "VIC", "VHM", "VRE",               # Vingroup
    "SSI", "VCI",                      # Securities
    "MWG", "PNJ"                       # Retail
]

# Database Table Names
TABLE_SYMBOLS = "stock_symbols"
TABLE_PRICES = "stock_prices"

# n8n Automation Settings
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "")
