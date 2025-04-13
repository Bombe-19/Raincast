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
                "../../data/rainfall_data.csv",
                "/app/data/rainfall_data.csv",
                "/data/rainfall_data.csv"
            ]
            
            for alt_path in alternative_paths:
                if os.path.exists(alt_path):
                    file_path = alt_path
                    print(f"Found dataset at {file_path}")
                    break
            else:
                # If no dataset is found, create a simple dummy dataset for imputer fitting
                print("No dataset found. Creating a dummy dataset for imputer fitting.")
                return create_dummy_dataset()
        
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
        import traceback
        traceback.print_exc()
        # Create a dummy dataset as fallback
        return create_dummy_dataset()

def create_dummy_dataset():
    """Create a simple dummy dataset for imputer fitting when no real dataset is available"""
    print("Creating dummy dataset for model initialization")
    
    # Create a basic structure with all expected columns
    data = {
        'YEAR': [2020, 2021, 2022, 2023],
        'JAN': [10.5, 12.3, 9.8, 11.2],
        'FEB': [15.2, 14.8, 16.1, 15.5],
        'MAR': [20.1, 19.5, 21.2, 20.8],
        'APR': [25.3, 24.8, 26.1, 25.7],
        'MAY': [30.5, 29.8, 31.2, 30.9],
        'JUN': [150.2, 145.8, 155.3, 152.1],
        'JUL': [200.5, 195.8, 205.3, 202.1],
        'AUG': [180.3, 175.8, 185.2, 182.5],
        'SEP': [120.5, 115.8, 125.3, 122.1],
        'OCT': [50.2, 48.5, 52.1, 51.3],
        'NOV': [25.3, 24.1, 26.5, 25.8],
        'DEC': [15.2, 14.5, 16.1, 15.8],
        'Jan-Feb': [25.7, 27.1, 25.9, 26.7],
        'Mar-May': [75.9, 74.1, 78.5, 77.4],
        'Jun-Sep': [651.5, 633.2, 671.1, 658.8],
        'Oct-Dec': [90.7, 87.1, 94.7, 92.9],
        'ANNUAL': [843.8, 821.5, 870.2, 855.8],
        'RainToday': [1, 0, 1, 0],
        'PredictedRainTomorrow': [1, 0, 1, 0],
        'SPRING': [0, 0, 1, 0],
        'SUMMER': [0, 1, 0, 0],
        'MONSOON': [1, 0, 0, 1],
        'AUTUMN': [0, 0, 0, 0],
        'WINTER': [0, 0, 0, 0]
    }
    
    # Add subdivision columns (one-hot encoded)
    for subdivision in [
        "ANDAMAN & NICOBAR ISLANDS", "ARUNACHAL PRADESH", "ASSAM & MEGHALAYA", 
        "BIHAR", "CHHATTISGARH", "COASTAL ANDHRA PRADESH", "COASTAL KARNATAKA",
        "EAST MADHYA PRADESH", "EAST RAJASTHAN", "EAST UTTAR PRADESH", 
        "GANGETIC WEST BENGAL", "GUJARAT REGION", "HARYANA DELHI & CHANDIGARH",
        "HIMACHAL PRADESH", "JAMMU & KASHMIR", "JHARKHAND", "KERALA", "KONKAN & GOA",
        "LAKSHADWEEP", "MADHYA MAHARASHTRA", "MATATHWADA", "NAGA MANI MIZO TRIPURA",
        "NORTH INTERIOR KARNATAKA", "ORISSA", "PUNJAB", "RAYALSEEMA", "SAURASHTRA & KUTCH",
        "SOUTH INTERIOR KARNATAKA", "SUB HIMALAYAN WEST BENGAL & SIKKIM", "TAMIL NADU",
        "TELANGANA", "UTTARAKHAND", "VIDARBHA", "WEST MADHYA PRADESH", "WEST RAJASTHAN",
        "WEST UTTAR PRADESH"
    ]:
        col_name = f"SUBDIVISION_{subdivision}"
        # Set Kerala as 1 for first row, distribute others
        if subdivision == "KERALA":
            data[col_name] = [1, 0, 0, 0]
        elif subdivision == "TAMIL NADU":
            data[col_name] = [0, 1, 0, 0]
        elif subdivision == "COASTAL KARNATAKA":
            data[col_name] = [0, 0, 1, 0]
        elif subdivision == "WEST RAJASTHAN":
            data[col_name] = [0, 0, 0, 1]
        else:
            data[col_name] = [0, 0, 0, 0]
    
    df = pd.DataFrame(data)
    print(f"Created dummy dataset with {df.shape[0]} rows and {df.shape[1]} columns")
    return df

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
    
    # Add seasonal statistics
    if 'MONSOON' in df.columns and 'SPRING' in df.columns and 'SUMMER' in df.columns and 'AUTUMN' in df.columns and 'WINTER' in df.columns:
        monsoon_data = df[df['MONSOON'] == 1]
        spring_data = df[df['SPRING'] == 1]
        summer_data = df[df['SUMMER'] == 1]
        autumn_data = df[df['AUTUMN'] == 1]
        winter_data = df[df['WINTER'] == 1]
        
        stats['monsoon_rain_probability'] = monsoon_data['PredictedRainTomorrow'].mean() * 100 if not monsoon_data.empty else 0
        stats['spring_rain_probability'] = spring_data['PredictedRainTomorrow'].mean() * 100 if not spring_data.empty else 0
        stats['summer_rain_probability'] = summer_data['PredictedRainTomorrow'].mean() * 100 if not summer_data.empty else 0
        stats['autumn_rain_probability'] = autumn_data['PredictedRainTomorrow'].mean() * 100 if not autumn_data.empty else 0
        stats['winter_rain_probability'] = winter_data['PredictedRainTomorrow'].mean() * 100 if not winter_data.empty else 0
    
    return stats
