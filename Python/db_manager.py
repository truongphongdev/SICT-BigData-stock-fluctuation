import logging
import pandas as pd
from sqlalchemy import create_engine, text, MetaData, Table, Column, String, Date, Float, BigInteger, DateTime, PrimaryKeyConstraint
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
        
        # Define tables schemas
        self.symbols_table = Table(
            config.TABLE_SYMBOLS,
            self.metadata,
            Column("symbol", String(20), primary_key=True),
            Column("organ_name", String(500)),
            Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        )
        
        self.prices_table = Table(
            config.TABLE_PRICES,
            self.metadata,
            Column("symbol", String(20), primary_key=True),
            Column("time", Date, primary_key=True),
            Column("open", Float),
            Column("high", Float),
            Column("low", Float),
            Column("close", Float),
            Column("volume", BigInteger),
            Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
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
        Save symbols to PostgreSQL using upsert (ON CONFLICT DO UPDATE).
        Returns the number of saved symbols.
        """
        if not self.engine:
            raise RuntimeError("Database engine not connected.")
        if df_symbols.empty:
            logger.warning("Empty symbols DataFrame. Skipping save.")
            return 0
            
        inserted_count = 0
        try:
            # Convert DataFrame to list of dicts for SQLalchemy core
            records = df_symbols.to_dict(orient="records")
            
            with self.engine.begin() as conn:
                for record in records:
                    # Construct postgres-specific upsert
                    stmt = pg_insert(self.symbols_table).values(
                        symbol=record["symbol"],
                        organ_name=record["organ_name"],
                        updated_at=datetime.utcnow()
                    )
                    upsert_stmt = stmt.on_conflict_do_update(
                        index_elements=["symbol"],
                        set_={
                            "organ_name": stmt.excluded.organ_name,
                            "updated_at": stmt.excluded.updated_at
                        }
                    )
                    conn.execute(upsert_stmt)
                    inserted_count += 1
            logger.info(f"Upserted {inserted_count} symbols into database.")
            return inserted_count
        except Exception as e:
            logger.error(f"Error saving symbols to database: {e}")
            raise

    def save_prices(self, df_prices: pd.DataFrame) -> int:
        """
        Save prices to PostgreSQL using upsert (ON CONFLICT DO UPDATE).
        Returns the number of saved price rows.
        """
        if not self.engine:
            raise RuntimeError("Database engine not connected.")
        if df_prices.empty:
            logger.warning("Empty prices DataFrame. Skipping save.")
            return 0
            
        inserted_count = 0
        try:
            # Convert time column to date objects/strings if they are datetime64
            df_to_save = df_prices.copy()
            if "time" in df_to_save.columns:
                if pd.api.types.is_datetime64_any_dtype(df_to_save["time"]):
                    df_to_save["time"] = df_to_save["time"].dt.date
                else:
                    df_to_save["time"] = pd.to_datetime(df_to_save["time"]).dt.date
            
            records = df_to_save.to_dict(orient="records")
            
            with self.engine.begin() as conn:
                for record in records:
                    stmt = pg_insert(self.prices_table).values(
                        symbol=record["symbol"],
                        time=record["time"],
                        open=record["open"],
                        high=record["high"],
                        low=record["low"],
                        close=record["close"],
                        volume=record["volume"],
                        updated_at=datetime.utcnow()
                    )
                    upsert_stmt = stmt.on_conflict_do_update(
                        index_elements=["symbol", "time"],
                        set_={
                            "open": stmt.excluded.open,
                            "high": stmt.excluded.high,
                            "low": stmt.excluded.low,
                            "close": stmt.excluded.close,
                            "volume": stmt.excluded.volume,
                            "updated_at": stmt.excluded.updated_at
                        }
                    )
                    conn.execute(upsert_stmt)
                    inserted_count += 1
            logger.info(f"Upserted {inserted_count} price rows into database.")
            return inserted_count
        except Exception as e:
            logger.error(f"Error saving prices to database: {e}")
            raise
