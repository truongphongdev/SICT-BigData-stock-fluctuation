"""
CLI Script to manually trigger retraining of the stock prediction model.
"""
import sys
import os
import argparse

# Allow importing from the 'app' directory by appending root path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml.training.train import train_model

def main():
    """CLI wrapper to run training pipeline."""
    parser = argparse.ArgumentParser(description="Retrain the Stock Predictor model.")
    parser.add_argument("--data", type=str, default="data/historical_prices.csv", help="Path to training data csv")
    parser.add_argument("--out", type=str, default="app/ml/models/best_model.pt", help="Path to save model weights")
    
    args = parser.parse_args()
    
    print(f"Retraining model using data: {args.data}")
    train_model(args.data, args.out)
    print("Retraining completed successfully!")

if __name__ == "__main__":
    main()
