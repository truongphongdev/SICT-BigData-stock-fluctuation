"""
Technical Indicators computation using Pandas and NumPy.
Supports RSI, MACD, EMA, Bollinger Bands, and Key Support/Resistance levels.
"""
from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd

def calculate_rsi(series: pd.Series, period: int = 14) -> float:
    """Calculates Relative Strength Index (RSI)."""
    if len(series) < period + 1:
        return 50.0
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    last_rsi = rsi.iloc[-1]
    if np.isnan(last_rsi):
        return 50.0
    return float(np.round(last_rsi, 1))

def calculate_ema(series: pd.Series, period: int) -> float:
    """Calculates Exponential Moving Average (EMA)."""
    if len(series) == 0:
        return 0.0
    ema = series.ewm(span=period, adjust=False).mean()
    return float(np.round(ema.iloc[-1], 2))

def calculate_macd(series: pd.Series, fast: int = 12, slow: int = 26, signal_period: int = 9) -> Tuple[float, float, float, str]:
    """
    Calculates MACD, Signal line, and Histogram.
    Returns (macd_val, macd_signal, macd_hist, description_string).
    """
    if len(series) < slow:
        return (0.0, 0.0, 0.0, "+0.00 (Neutral)")
    
    ema_fast = series.ewm(span=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
    histogram = macd_line - signal_line

    val = float(np.round(macd_line.iloc[-1], 2))
    sig = float(np.round(signal_line.iloc[-1], 2))
    hist = float(np.round(histogram.iloc[-1], 2))

    if val > sig and val > 0:
        desc = f"+{val:.2f} (Strong Bullish)" if hist > 0.5 else f"+{val:.2f} (Bullish)"
    elif val < sig and val < 0:
        desc = f"{val:.2f} (Bearish)"
    else:
        desc = f"{val:+.2f} (Neutral)"

    return (val, sig, hist, desc)

def calculate_bollinger_bands(series: pd.Series, period: int = 20, num_std: float = 2.0) -> Tuple[float, float, float]:
    """
    Calculates Bollinger Bands (Upper, Middle, Lower).
    """
    if len(series) < period:
        last = float(series.iloc[-1]) if len(series) > 0 else 100.0
        return (last * 1.05, last, last * 0.95)
    
    middle = series.rolling(window=period).mean().iloc[-1]
    std = series.rolling(window=period).std().iloc[-1]
    upper = middle + (std * num_std)
    lower = middle - (std * num_std)

    return (float(np.round(upper, 2)), float(np.round(middle, 2)), float(np.round(lower, 2)))

def calculate_support_resistance(highs: pd.Series, lows: pd.Series, closes: pd.Series) -> Tuple[float, float]:
    """
    Estimates key support and resistance levels from recent price action.
    """
    if len(closes) == 0:
        return (105.0, 95.0)
    
    last_close = closes.iloc[-1]
    recent_high = highs.tail(20).max() if len(highs) >= 20 else last_close * 1.06
    recent_low = lows.tail(20).min() if len(lows) >= 20 else last_close * 0.94

    resistance = float(np.round(max(recent_high, last_close * 1.03), 2))
    support = float(np.round(min(recent_low, last_close * 0.97), 2))

    return (resistance, support)

def extract_all_indicators(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Given a DataFrame with columns ['open', 'high', 'low', 'close', 'volume'],
    computes all technical indicators.
    """
    if df.empty or 'close' not in df.columns:
        return {}

    closes = df['close']
    highs = df['high'] if 'high' in df.columns else closes
    lows = df['low'] if 'low' in df.columns else closes
    last_price = float(closes.iloc[-1])

    rsi = calculate_rsi(closes, 14)
    if rsi > 70:
        rsi_status = 'Quá mua (Overbought)'
    elif rsi < 30:
        rsi_status = 'Quá bán (Oversold)'
    else:
        rsi_status = 'Trung tính (Neutral)'

    macd_val, macd_sig, macd_hist, macd_desc = calculate_macd(closes)
    bb_upper, bb_mid, bb_lower = calculate_bollinger_bands(closes)
    ema_20 = calculate_ema(closes, 20)
    ema_50 = calculate_ema(closes, 50)
    resistance, support = calculate_support_resistance(highs, lows, closes)

    return {
        "price": last_price,
        "rsi": rsi,
        "rsi_status": rsi_status,
        "macd_val": macd_val,
        "macd_signal": macd_sig,
        "macd_hist": macd_hist,
        "macd_desc": macd_desc,
        "ema_20": ema_20,
        "ema_50": ema_50,
        "bb_upper": bb_upper,
        "bb_middle": bb_mid,
        "bb_lower": bb_lower,
        "resistance": resistance,
        "support": support
    }
