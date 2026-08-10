"""
Dataset pipeline module. Creates dataset objects for PyTorch or scikit-learn.
"""
from typing import Tuple
import pandas as pd
import numpy as np

def prepare_train_test_split(df: pd.DataFrame, test_size: float = 0.2) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Prepares train and test splits for the model training."""
    # Stub implementation returning dummy numpy arrays
    X = df.drop(columns=['Target']).values if 'Target' in df.columns else np.zeros((10, 5))
    y = df['Target'].values if 'Target' in df.columns else np.zeros((10,))
    
    split_idx = int(len(X) * (1 - test_size))
    return X[:split_idx], X[split_idx:], y[:split_idx], y[split_idx:]
