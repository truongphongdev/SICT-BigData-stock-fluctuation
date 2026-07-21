import logging
import pandas as pd
from sqlalchemy import create_engine, text, MetaData, Table, Column, String, Date, Numeric, BigInteger, DateTime, Boolean
from sqlalchemy.dialects.postgresql import insert as pg_insert
from datetime import datetime
import config

# Configure logging
logger = logging.getLogger(__name__)

class DBManager:
    def __init__(self, db_uri: str = config.DB_URI):
        self.db_uri = db_uri
        self.engine = None
        self.metadata = MetaData()
        
        # ── Table 1: stock_symbols ──────────────────────────────────────
        self.symbols_table = Table(
            config.TABLE_SYMBOLS,
            self.metadata,
            Column("symbol",     String(20),  primary_key=True),
            Column("organ_name", String(500)),
            Column("exchange",   String(20)),   # HOSE / HNX / UPCOM
            Column("sector",     String(100)),  # Ngành (mở rộng sau)
            Column("is_active",  Boolean, default=True),
            Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow),
        )

        # ── Table 2: stock_prices ───────────────────────────────────────
        self.prices_table = Table(
            config.TABLE_PRICES,
            self.metadata,
            Column("symbol",     String(20),     primary_key=True),
            Column("trade_date", Date,           primary_key=True),
            Column("open",       Numeric(12, 2)),
            Column("high",       Numeric(12, 2)),
            Column("low",        Numeric(12, 2)),
            Column("close",      Numeric(12, 2)),
            Column("volume",     BigInteger),
            Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow),
        )

    def connect(self) -> bool:
        """Establish a connection to the database. Returns True if successful."""
        try:
            self.engine = create_engine(self.db_uri, pool_pre_ping=True)
            # Test the connection
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection established successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            self.engine = None
            return False

    def init_db(self):
        """Create tables if they do not exist."""
        if not self.engine:
            raise RuntimeError("Database engine not connected. Call connect() first.")
        
        try:
            logger.info("Initializing database tables...")
            self.metadata.create_all(self.engine)
            logger.info("Database tables initialized successfully.")
        except Exception as e:
            logger.error(f"Error initializing database tables: {e}")
            raise

    def save_symbols(self, df_symbols: pd.DataFrame) -> int:
        """
        Bulk upsert symbols into stock_symbols using PostgreSQL ON CONFLICT DO UPDATE.
        Returns the number of rows processed.
        """
        if not self.engine:
            raise RuntimeError("Database engine not connected.")
        if df_symbols.empty:
            logger.warning("Empty symbols DataFrame. Skipping save.")
            return 0

        df_to_save = df_symbols.copy()
        for col in ["exchange", "sector"]:
            if col not in df_to_save.columns:
                df_to_save[col] = None
        if "is_active" not in df_to_save.columns:
            df_to_save["is_active"] = True
        df_to_save["updated_at"] = datetime.utcnow()

        try:
            from sqlalchemy.dialects.postgresql import insert as pg_insert
            records = df_to_save[["symbol", "organ_name", "exchange", "sector", "is_active", "updated_at"]].to_dict(orient="records")
            stmt = pg_insert(self.symbols_table).values(records)
            upsert_stmt = stmt.on_conflict_do_update(
                index_elements=["symbol"],
                set_={
                    "organ_name": stmt.excluded.organ_name,
                    "exchange":   stmt.excluded.exchange,
                    "sector":     stmt.excluded.sector,
                    "updated_at": stmt.excluded.updated_at,
                }
            )
            with self.engine.begin() as conn:
                conn.execute(upsert_stmt)
            count = len(records)
            logger.info(f"Upserted {count} symbols into database.")
            return count
        except Exception as e:
            logger.error(f"Error saving symbols to database: {e}")
            raise

    def save_prices(self, df_prices: pd.DataFrame) -> int:
        """
        Bulk upsert OHLCV price rows using PostgreSQL ON CONFLICT DO UPDATE.
        Accepts column 'time' or 'trade_date' as date column.
        Returns the number of rows processed.
        """
        if not self.engine:
            raise RuntimeError("Database engine not connected.")
        if df_prices.empty:
            logger.warning("Empty prices DataFrame. Skipping save.")
            return 0

        df_to_save = df_prices.copy()
        # Accept either 'time' (legacy) or 'trade_date'
        if "time" in df_to_save.columns and "trade_date" not in df_to_save.columns:
            df_to_save.rename(columns={"time": "trade_date"}, inplace=True)
        if pd.api.types.is_datetime64_any_dtype(df_to_save["trade_date"]):
            df_to_save["trade_date"] = df_to_save["trade_date"].dt.date
        else:
            df_to_save["trade_date"] = pd.to_datetime(df_to_save["trade_date"]).dt.date
        df_to_save["updated_at"] = datetime.utcnow()

        try:
            from sqlalchemy.dialects.postgresql import insert as pg_insert
            records = df_to_save[["symbol", "trade_date", "open", "high", "low", "close", "volume", "updated_at"]].to_dict(orient="records")
            stmt = pg_insert(self.prices_table).values(records)
            upsert_stmt = stmt.on_conflict_do_update(
                index_elements=["symbol", "trade_date"],
                set_={
                    "open":       stmt.excluded.open,
                    "high":       stmt.excluded.high,
                    "low":        stmt.excluded.low,
                    "close":      stmt.excluded.close,
                    "volume":     stmt.excluded.volume,
                    "updated_at": stmt.excluded.updated_at,
                }
            )
            with self.engine.begin() as conn:
                conn.execute(upsert_stmt)
            count = len(records)
            logger.info(f"Upserted {count} price rows into database.")
            return count
        except Exception as e:
            logger.error(f"Error saving prices to database: {e}")
            raise

    def get_latest_date(self, symbol: str) -> str | None:
        """Return the latest trade_date stored for a symbol (dùng cho incremental update)."""
        if not self.engine:
            return None
        try:
            with self.engine.connect() as conn:
                result = conn.execute(
                    text(f"SELECT MAX(trade_date) FROM {config.TABLE_PRICES} WHERE symbol = :sym"),
                    {"sym": symbol}
                ).fetchone()
            return str(result[0]) if result and result[0] else None
        except Exception:
            return None
