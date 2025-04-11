import pandas as pd
import os

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
        
        # Basic preprocessing if needed
        # Handle missing values
        df = df.fillna(0)
        
        return df
    
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None