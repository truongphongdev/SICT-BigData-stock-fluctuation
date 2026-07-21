"""
pipeline.py — Entry point chính của Stock Data Ingestion Pipeline.

Cách dùng:
  python pipeline.py                          # Lấy 30 ngày gần nhất cho tất cả mã mặc định
  python pipeline.py --symbols VCB,ACB        # Chỉ lấy một số mã
  python pipeline.py --start-date 2026-01-01  # Lấy từ ngày cụ thể
  python pipeline.py --verify-only            # Chỉ lưu CSV, không vào DB
"""
import os
import argparse
import logging
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd
import requests
import config
from fetcher import fetch_all_symbols, fetch_price_history
from db_manager import DBManager

# ── Logging setup ────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(LOG_DIR / "pipeline.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)


def trigger_n8n_webhook(status: str, payload_data: dict):
    """Gửi báo cáo thực thi lên n8n Webhook nếu đã cấu hình."""
    webhook_url = config.N8N_WEBHOOK_URL
    if not webhook_url:
        logger.info("n8n webhook URL is not configured. Skipping notification.")
        return

    payload = {
        "status": status,
        "timestamp": datetime.now().isoformat(),
        **payload_data,
    }
    try:
        logger.info(f"Sending execution status to n8n webhook: {webhook_url}")
        response = requests.post(webhook_url, json=payload, timeout=10)
        if response.status_code in [200, 201]:
            logger.info("Successfully triggered n8n workflow.")
        else:
            logger.warning(f"Failed to trigger n8n workflow. Response code: {response.status_code}")
    except Exception as e:
        logger.error(f"Error calling n8n webhook: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="Vietnamese Stock Data Ingestion Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ví dụ:
  python pipeline.py
  python pipeline.py --symbols VCB,ACB,FPT
  python pipeline.py --start-date 2026-01-01 --end-date 2026-07-21
  python pipeline.py --verify-only
        """,
    )
    parser.add_argument(
        "--symbols",
        type=str,
        help="Danh sách mã cách nhau bởi dấu phẩy (VD: VCB,ACB,TCB). Mặc định dùng danh sách trong config.py.",
    )
    parser.add_argument(
        "--start-date",
        type=str,
        help="Ngày bắt đầu YYYY-MM-DD (mặc định: 30 ngày trước)",
    )
    parser.add_argument(
        "--end-date",
        type=str,
        help="Ngày kết thúc YYYY-MM-DD (mặc định: hôm nay)",
    )
    parser.add_argument(
        "--source",
        type=str,
        default=config.DEFAULT_STOCK_SOURCE,
        help="Nguồn dữ liệu vnstock: VCI hoặc KBS (mặc định: VCI)",
    )
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="Chỉ lưu CSV cục bộ vào data/, không ghi vào database.",
    )
    parser.add_argument(
        "--skip-n8n",
        action="store_true",
        help="Bỏ qua gửi thông báo n8n webhook.",
    )

    args = parser.parse_args()

    # Đảm bảo thư mục data/ tồn tại (dùng cho CSV backup / verify-only)
    os.makedirs(BASE_DIR / "data", exist_ok=True)

    # Xác định danh sách mã
    if args.symbols:
        symbols = [s.strip().upper() for s in args.symbols.split(",") if s.strip()]
    else:
        symbols = config.DEFAULT_SYMBOLS

    # Xác định khoảng ngày
    end_date = args.end_date or datetime.now().strftime("%Y-%m-%d")
    start_date = args.start_date or (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

    logger.info("=========================================")
    logger.info("Stock Ingestion Pipeline Starting")
    logger.info(f"Target symbols: {symbols}")
    logger.info(f"Source: {args.source}")
    logger.info(f"Date Range: {start_date} to {end_date}")
    logger.info("=========================================")

    # ── 1. Fetch danh sách niêm yết ─────────────────────────────────────────
    df_listings = fetch_all_symbols(source=args.source)
    if not df_listings.empty and symbols:
        target_listings = df_listings[df_listings["symbol"].isin(symbols)]
        logger.info(f"Target symbols info:\n{target_listings.to_string(index=False)}")

    # ── 2. Fetch giá lịch sử ─────────────────────────────────────────────────
    all_prices = []
    failed_symbols = []

    for symbol in symbols:
        df_price = fetch_price_history(
            symbol=symbol,
            start_date=start_date,
            end_date=end_date,
            source=args.source,
        )
        if not df_price.empty:
            all_prices.append(df_price)
        else:
            failed_symbols.append(symbol)

    if all_prices:
        df_all_prices = pd.concat(all_prices, ignore_index=True)
        logger.info(
            f"Fetched {len(df_all_prices)} price rows across "
            f"{len(symbols) - len(failed_symbols)}/{len(symbols)} symbols."
        )
    else:
        df_all_prices = pd.DataFrame()
        logger.warning("No price history fetched for any symbol.")

    if failed_symbols:
        logger.warning(f"Failed symbols: {failed_symbols}")

    # ── 3. Lưu dữ liệu ───────────────────────────────────────────────────────
    saved_to_db = False
    saved_symbols_count = 0
    saved_prices_count = 0

    if args.verify_only:
        # Chế độ kiểm tra: chỉ lưu CSV
        logger.info("Running in --verify-only mode. Saving to data/ directory.")
        if not df_listings.empty:
            path = BASE_DIR / "data" / "symbols_listing.csv"
            df_listings.to_csv(path, index=False, encoding="utf-8-sig")
            logger.info(f"Saved {len(df_listings)} symbols to: {path}")
            saved_symbols_count = len(df_listings)
        if not df_all_prices.empty:
            for symbol, group in df_all_prices.groupby("symbol"):
                path = BASE_DIR / "data" / f"{symbol}_prices.csv"
                group.to_csv(path, index=False, encoding="utf-8-sig")
                saved_prices_count += len(group)
            logger.info(f"Saved {saved_prices_count} price rows to data/ directory.")
    else:
        # Chế độ chính: ghi vào PostgreSQL
        logger.info("Connecting to PostgreSQL database...")
        db = DBManager()
        if db.connect():
            try:
                db.init_db()
                if not df_listings.empty:
                    saved_symbols_count = db.save_symbols(df_listings)
                if not df_all_prices.empty:
                    saved_prices_count = db.save_prices(df_all_prices)
                saved_to_db = True
                logger.info("Database ingestion completed successfully.")
            except Exception as e:
                logger.error(f"Database ingestion error: {e}")
                logger.warning("Falling back to CSV export...")
        else:
            logger.warning("Could not connect to PostgreSQL. Falling back to CSV export.")

        # Fallback: lưu CSV nếu DB lỗi
        if not saved_to_db:
            if not df_listings.empty:
                path = BASE_DIR / "data" / "symbols_listing.csv"
                df_listings.to_csv(path, index=False, encoding="utf-8-sig")
                saved_symbols_count = len(df_listings)
            if not df_all_prices.empty:
                for symbol, group in df_all_prices.groupby("symbol"):
                    path = BASE_DIR / "data" / f"{symbol}_prices.csv"
                    group.to_csv(path, index=False, encoding="utf-8-sig")
                    saved_prices_count += len(group)
            logger.info(f"Fallback CSV saved: {saved_symbols_count} symbols, {saved_prices_count} prices.")

    # ── 4. Gửi n8n webhook ────────────────────────────────────────────────────
    if not args.skip_n8n:
        status_str = "SUCCESS" if (saved_symbols_count > 0 or saved_prices_count > 0) else "FAILED"
        trigger_n8n_webhook(
            status=status_str,
            payload_data={
                "saved_to_db": saved_to_db,
                "verify_only": args.verify_only,
                "total_symbols_fetched": len(df_listings),
                "saved_symbols_count": saved_symbols_count,
                "saved_prices_count": saved_prices_count,
                "failed_symbols": failed_symbols,
                "start_date": start_date,
                "end_date": end_date,
                "source": args.source,
            },
        )

    logger.info("=========================================")
    logger.info("Stock Ingestion Pipeline Completed")
    logger.info(f"Symbols upserted : {saved_symbols_count}")
    logger.info(f"Price rows upserted: {saved_prices_count}")
    if failed_symbols:
        logger.info(f"Failed symbols   : {failed_symbols}")
    logger.info("=========================================")


if __name__ == "__main__":
    main()
