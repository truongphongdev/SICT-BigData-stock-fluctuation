"""
Dataset pipeline module for time-series stock data.
Performs strictly chronological train/test split per stock symbol.
"""
from typing import Tuple, List
import pandas as pd
import numpy as np


def time_based_train_test_split(
    df: pd.DataFrame,
    feature_cols: List[str],
    target_col: str = "target",
    test_size: float = 0.2
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, pd.DataFrame, pd.DataFrame]:
    """
    Performs a chronological train/test split per symbol to prevent lookahead data leakage.
    Returns (X_train, X_test, y_train, y_test, train_df, test_df).
    """
    train_dfs = []
    test_dfs = []

    # Group by symbol and split chronologically
    symbols = df["symbol"].unique() if "symbol" in df.columns else [None]

    for sym in symbols:
        sub_df = df[df["symbol"] == sym].sort_values("time") if sym is not None else df.sort_values("time")
        n = len(sub_df)
        if n < 5:
            train_dfs.append(sub_df)
            continue
        
        split_idx = int(n * (1 - test_size))
        train_dfs.append(sub_df.iloc[:split_idx])
        test_dfs.append(sub_df.iloc[split_idx:])

    train_df = pd.concat(train_dfs, ignore_index=True) if train_dfs else pd.DataFrame()
    test_df = pd.concat(test_dfs, ignore_index=True) if test_dfs else pd.DataFrame()

    # If test_df is empty (e.g. tiny dataset), fallback to last 20% of whole dataset
    if test_df.empty:
        split_idx = int(len(df) * (1 - test_size))
        train_df = df.iloc[:split_idx]
        test_df = df.iloc[split_idx:]

    X_train = train_df[feature_cols].copy()
    y_train = train_df[target_col].values
    X_test = test_df[feature_cols].copy()
    y_test = test_df[target_col].values

    return X_train, X_test, y_train, y_test, train_df, test_df
