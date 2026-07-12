import os
import argparse
import logging
from datetime import datetime, timedelta
import pandas as pd
import requests
import config
from data_downloader import fetch_all_symbols, fetch_price_history
from db_manager import DBManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("pipeline.log", encoding="utf-8")
    ]
)
logger = logging.getLogger(__name__)

def trigger_n8n_webhook(status: str, payload_data: dict):
    """Send execution report to n8n Webhook if configured."""
    webhook_url = config.N8N_WEBHOOK_URL
    if not webhook_url:
        logger.info("n8n webhook URL is not configured. Skipping notification.")
        return

    payload = {
        "status": status,
        "timestamp": datetime.now().isoformat(),
        **payload_data
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
    parser = argparse.ArgumentParser(description="Vietnamese Stock Data Ingestion Pipeline")
    parser.add_argument(
        "--symbols", 
        type=str, 
        help="Comma-separated stock symbols (e.g. VCB,ACB,TCB). If omitted, defaults in config.py are used."
    )
    parser.add_argument(
        "--start-date", 
        type=str, 
        help="Start date YYYY-MM-DD (defaults to 30 days ago)"
    )
    parser.add_argument(
        "--end-date", 
        type=str, 
        help="End date YYYY-MM-DD (defaults to today)"
    )
    parser.add_argument(
        "--source", 
        type=str, 
        default=config.DEFAULT_STOCK_SOURCE, 
        help="vnstock source: VCI or KBS (default: VCI)"
    )
    parser.add_argument(
        "--verify-only", 
        action="store_true", 
        help="Only pull data and save to local CSV files to verify pulling functionality. Skip database."
    )
    parser.add_argument(
        "--skip-n8n",
        action="store_true",
        help="Skip triggering n8n webhook notification."
    )
    
    args = parser.parse_args()

    # Create local output directory for verification files
    os.makedirs("data", exist_ok=True)

    # Determine symbols
    if args.symbols:
        symbols = [s.strip().upper() for s in args.symbols.split(",") if s.strip()]
    else:
        symbols = config.DEFAULT_SYMBOLS

    # Determine dates
    end_date = args.end_date or datetime.now().strftime("%Y-%m-%d")
    start_date = args.start_date or (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

    logger.info("=========================================")
    logger.info("Stock Ingestion Pipeline Starting")
    logger.info(f"Target symbols: {symbols}")
    logger.info(f"Source: {args.source}")
    logger.info(f"Date Range: {start_date} to {end_date}")
    logger.info("=========================================")

    # 1. Fetch Listings (All Symbols)
    df_listings = fetch_all_symbols(source=args.source)

    # Filter listings to only contain details for our target symbols if possible
    # (helps verify symbols mapping)
    if not df_listings.empty and symbols:
        target_listings = df_listings[df_listings["symbol"].isin(symbols)]
        logger.info(f"Retrieved target symbols listings details:\n{target_listings.to_string(index=False)}")

    # 2. Fetch Prices
    all_prices = []
    failed_symbols = []
    
    for symbol in symbols:
        df_price = fetch_price_history(
            symbol=symbol,
            start_date=start_date,
            end_date=end_date,
            source=args.source
        )
        if not df_price.empty:
            all_prices.append(df_price)
        else:
            failed_symbols.append(symbol)

    if all_prices:
        df_all_prices = pd.concat(all_prices, ignore_index=True)
        total_price_rows = len(df_all_prices)
        logger.info(f"Successfully fetched {total_price_rows} total price rows across {len(symbols) - len(failed_symbols)} symbols.")
    else:
        df_all_prices = pd.DataFrame()
        total_price_rows = 0
        logger.warning("No price history fetched for any symbol.")

    # 3. Save Data (Database or CSV Local fall-back)
    saved_to_db = False
    saved_symbols_count = 0
    saved_prices_count = 0

    if args.verify_only:
        logger.info("Running in --verify-only mode. Saving directly to CSV files in 'data/' directory.")
        # Save listings
        if not df_listings.empty:
            symbols_path = "data/symbols_listing.csv"
            df_listings.to_csv(symbols_path, index=False, encoding="utf-8-sig")
            logger.info(f"Saved listing symbols to: {symbols_path}")
            saved_symbols_count = len(df_listings)
            
        # Save prices
        if not df_all_prices.empty:
            for symbol, group in df_all_prices.groupby("symbol"):
                prices_path = f"data/{symbol}_prices.csv"
                group.to_csv(prices_path, index=False, encoding="utf-8-sig")
                logger.info(f"Saved prices for {symbol} to: {prices_path}")
                saved_prices_count += len(group)
    else:
        # DB Ingestion mode
        logger.info("Attempting to connect to PostgreSQL database...")
        db = DBManager()
        if db.connect():
            try:
                # Initialize tables
                db.init_db()
                
                # Save listings to database (upsert)
                if not df_listings.empty:
                    saved_symbols_count = db.save_symbols(df_listings)
                
                # Save historical prices to database (upsert)
                if not df_all_prices.empty:
                    saved_prices_count = db.save_prices(df_all_prices)
                
                saved_to_db = True
                logger.info("Successfully completed database ingestion.")
            except Exception as e:
                logger.error(f"Error during database ingestion: {e}")
                logger.warning("Database write failed. Falling back to local CSV exports.")
        else:
            logger.warning("Could not establish connection to Postgres. Falling back to local CSV exports.")
            
        # Fallback to CSV if DB write failed
        if not saved_to_db:
            logger.info("Saving data to CSV fallback in 'data/' directory...")
            # Save listings
            if not df_listings.empty:
                symbols_path = "data/symbols_listing.csv"
                df_listings.to_csv(symbols_path, index=False, encoding="utf-8-sig")
                logger.info(f"Saved fallback listing symbols to: {symbols_path}")
                saved_symbols_count = len(df_listings)
                
            # Save prices
            if not df_all_prices.empty:
                for symbol, group in df_all_prices.groupby("symbol"):
                    prices_path = f"data/{symbol}_prices.csv"
                    group.to_csv(prices_path, index=False, encoding="utf-8-sig")
                    logger.info(f"Saved fallback prices for {symbol} to: {prices_path}")
                    saved_prices_count += len(group)

    # 4. Trigger n8n webhook notification
    if not args.skip_n8n:
        status_str = "SUCCESS" if (saved_symbols_count > 0 or saved_prices_count > 0) else "FAILED"
        report_data = {
            "saved_to_db": saved_to_db,
            "verify_only": args.verify_only,
            "total_symbols_fetched": len(df_listings),
            "saved_symbols_count": saved_symbols_count,
            "saved_prices_count": saved_prices_count,
            "failed_symbols": failed_symbols,
            "start_date": start_date,
            "end_date": end_date,
            "source": args.source
        }
        trigger_n8n_webhook(status=status_str, payload_data=report_data)

    logger.info("=========================================")
    logger.info("Stock Ingestion Pipeline Completed")
    logger.info(f"Ingested Symbols: {saved_symbols_count}")
    logger.info(f"Ingested Prices: {saved_prices_count}")
    logger.info("=========================================")

if __name__ == "__main__":
    main()
