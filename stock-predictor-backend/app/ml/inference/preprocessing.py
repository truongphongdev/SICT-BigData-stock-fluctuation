"""
Preprocessing functions for stock data before feeding to the ML model.
"""
from typing import List
import pandas as pd
import numpy as np

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans historical stock dataframe by handling missing values."""
    return df.ffill().bfill()

def extract_features(df: pd.DataFrame) -> np.ndarray:
    """Extracts features (like moving averages, returns) for prediction."""
    # Dummy implementation returning features array
    if 'Close' in df.columns:
        return df['Close'].values
    return np.zeros((10,))
