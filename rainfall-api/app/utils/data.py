import pandas as pd
import os
import numpy as np

def load_dataset(file_path="./data/rain_predictions1.csv"):
    """Load the rainfall dataset"""
    try:
        if not os.path.exists(file_path):
            print(f"Dataset not found at {file_path}")
            # If you have a default location or want to search in multiple locations
            alternative_paths = [
                "./rainfall_data.csv",
                "../data/rainfall_data.csv",
                "../../data/rainfall_data.csv"
            ]
            
            for alt_path in alternative_paths:
                if os.path.exists(alt_path):
                    file_path = alt_path
                    print(f"Found dataset at {file_path}")
                    break
            else:
                raise FileNotFoundError(f"Dataset not found in any of the expected locations")
        
        # Load the dataset
        df = pd.read_csv(file_path)
        print(f"Dataset loaded with {df.shape[0]} rows and {df.shape[1]} columns")
        
        # Basic preprocessing
        # Handle missing values
        df = df.fillna(0)
        
        # Ensure all subdivision columns are properly formatted
        for col in df.columns:
            if col.startswith('SUBDIVISION_'):
                # Ensure these are binary columns (0 or 1)
                df[col] = df[col].astype(int)
        
        # Ensure seasonal indicators are binary
        for season in ['SPRING', 'SUMMER', 'MONSOON', 'AUTUMN', 'WINTER']:
            if season in df.columns:
                df[season] = df[season].astype(int)
        
        # Ensure RainToday and PredictedRainTomorrow are binary
        if 'RainToday' in df.columns:
            df['RainToday'] = df['RainToday'].astype(int)
        
        if 'PredictedRainTomorrow' in df.columns:
            df['PredictedRainTomorrow'] = df['PredictedRainTomorrow'].astype(int)
        
        return df
    
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None

def get_rainfall_statistics():
    """Get general statistics about rainfall in India"""
    df = load_dataset()
    
    if df is None or df.empty:
        return None
    
    stats = {
        'avg_annual_rainfall': df['ANNUAL'].mean(),
        'max_annual_rainfall': df['ANNUAL'].max(),
        'min_annual_rainfall': df['ANNUAL'].min(),
        'monsoon_contribution': (df['Jun-Sep'].mean() / df['ANNUAL'].mean()) * 100 if df['ANNUAL'].mean() > 0 else 0,
        'rain_probability': df['PredictedRainTomorrow'].mean() * 100,
        'wettest_month': df[['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']].mean().idxmax(),
        'driest_month': df[['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']].mean().idxmin()
    }
    
    return stats
