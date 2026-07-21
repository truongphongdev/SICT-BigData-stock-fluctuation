import pandas as pd
from datetime import datetime, timedelta
from vnstock import Listing, Quote
import logging

# Configure logging
logger = logging.getLogger(__name__)

def fetch_all_symbols(source: str = "VCI") -> pd.DataFrame:
    """
    Fetch all listing stock symbols from the specified source.
    Returns a pandas DataFrame with columns ['symbol', 'organ_name'] or similar.
    """
    logger.info(f"Fetching listing symbols from source: {source}")
    try:
        listing = Listing(source=source)
        df_symbols = listing.all_symbols()
        
        if df_symbols is None or df_symbols.empty:
            logger.warning("No symbols returned from Listing API.")
            return pd.DataFrame(columns=["symbol", "organ_name"])
            
        # Ensure the columns match our target structure
        # Standard columns from vnstock: 'symbol', 'organ_name' (or 'organName')
        required_cols = ["symbol", "organ_name"]
        
        # Check if organName is returned instead of organ_name
        if "organName" in df_symbols.columns and "organ_name" not in df_symbols.columns:
            df_symbols = df_symbols.rename(columns={"organName": "organ_name"})
            
        # Keep only required columns that are present
        cols_to_keep = [col for col in required_cols if col in df_symbols.columns]
        df_cleaned = df_symbols[cols_to_keep].copy()
        
        # If 'organ_name' is missing, add an empty string column
        if "organ_name" not in df_cleaned.columns:
            df_cleaned["organ_name"] = ""
            
        # Select and order standard columns
        df_cleaned = df_cleaned[["symbol", "organ_name"]]
        logger.info(f"Successfully retrieved {len(df_cleaned)} symbols.")
        return df_cleaned
        
    except Exception as e:
        logger.error(f"Error fetching symbols: {e}")
        # Return empty dataframe with correct structure
        return pd.DataFrame(columns=["symbol", "organ_name"])

def fetch_price_history(
    symbol: str, 
    start_date: str = None, 
    end_date: str = None, 
    source: str = "VCI", 
    interval: str = "1D"
) -> pd.DataFrame:
    """
    Fetch historical prices for a given stock symbol.
    start_date: YYYY-MM-DD (defaults to 30 days ago)
    end_date: YYYY-MM-DD (defaults to today)
    """
    # Set default date range if not provided
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        
    logger.info(f"Fetching history for {symbol} ({start_date} to {end_date}) using {source}...")
    try:
        quote = Quote(symbol=symbol, source=source)
        df_prices = quote.history(start=start_date, end=end_date, interval=interval)
        
        if df_prices is None or df_prices.empty:
            logger.warning(f"No price history found for {symbol}.")
            return pd.DataFrame()
            
        # Ensure column types and rename/clean if needed
        # Standard output fields: ['time', 'open', 'high', 'low', 'close', 'volume']
        df_cleaned = df_prices.copy()
        
        # Add the symbol column so that we can distinguish prices in the database
        df_cleaned["symbol"] = symbol
        
        # Ensure volume is an integer and prices are floats
        df_cleaned["open"] = pd.to_numeric(df_cleaned["open"], errors="coerce")
        df_cleaned["high"] = pd.to_numeric(df_cleaned["high"], errors="coerce")
        df_cleaned["low"] = pd.to_numeric(df_cleaned["low"], errors="coerce")
        df_cleaned["close"] = pd.to_numeric(df_cleaned["close"], errors="coerce")
        df_cleaned["volume"] = pd.to_numeric(df_cleaned["volume"], errors="coerce").fillna(0).astype("int64")
        
        # Reorder columns to a clean DB insertion structure
        cols_order = ["symbol", "time", "open", "high", "low", "close", "volume"]
        df_cleaned = df_cleaned[[c for c in cols_order if c in df_cleaned.columns]]
        
        logger.info(f"Successfully retrieved {len(df_cleaned)} price records for {symbol}.")
        return df_cleaned
        
    except Exception as e:
        logger.error(f"Error fetching price history for {symbol}: {e}")
        return pd.DataFrame()
