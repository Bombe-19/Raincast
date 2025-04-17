import json
from pathlib import Path
import pandas as pd
import os
import numpy as np
import random

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
                print("Dataset not found in any of the expected locations. Generating synthetic data.")
                return generate_synthetic_data()
        
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
        return generate_synthetic_data()

def generate_synthetic_data():
    """Generate synthetic rainfall data for India"""
    print("Generating synthetic rainfall data...")
    
    # Define subdivisions
    subdivisions = [
        "ANDAMAN & NICOBAR ISLANDS", "ARUNACHAL PRADESH", "ASSAM & MEGHALAYA", 
        "BIHAR", "CHHATTISGARH", "COASTAL ANDHRA PRADESH", "COASTAL KARNATAKA", 
        "EAST MADHYA PRADESH", "EAST RAJASTHAN", "EAST UTTAR PRADESH", 
        "GANGETIC WEST BENGAL", "GUJARAT REGION", "HARYANA DELHI & CHANDIGARH", 
        "HIMACHAL PRADESH", "JAMMU & KASHMIR", "JHARKHAND", "KERALA", 
        "KONKAN & GOA", "LAKSHADWEEP", "MADHYA MAHARASHTRA", "MATATHWADA", 
        "NAGA MANI MIZO TRIPURA", "NORTH INTERIOR KARNATAKA", "ORISSA", 
        "PUNJAB", "RAYALSEEMA", "SAURASHTRA & KUTCH", "SOUTH INTERIOR KARNATAKA", 
        "SUB HIMALAYAN WEST BENGAL & SIKKIM", "TAMIL NADU", "TELANGANA", 
        "UTTARAKHAND", "VIDARBHA", "WEST MADHYA PRADESH", "WEST RAJASTHAN", 
        "WEST UTTAR PRADESH"
    ]
    
    # Define years
    years = list(range(2010, 2023))
    
    # Define months
    months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    
    # Create empty dataframe
    data = []
    
    # Generate data for each subdivision and year
    for subdivision in subdivisions:
        for year in years:
            # Generate monthly rainfall based on region characteristics
            if subdivision in ["KERALA", "COASTAL KARNATAKA", "KONKAN & GOA", "ASSAM & MEGHALAYA"]:
                # High rainfall regions
                monthly_rainfall = {
                    "JAN": random.uniform(10, 50),
                    "FEB": random.uniform(15, 60),
                    "MAR": random.uniform(30, 80),
                    "APR": random.uniform(80, 150),
                    "MAY": random.uniform(150, 300),
                    "JUN": random.uniform(500, 800),
                    "JUL": random.uniform(700, 1000),
                    "AUG": random.uniform(600, 900),
                    "SEP": random.uniform(300, 500),
                    "OCT": random.uniform(200, 350),
                    "NOV": random.uniform(100, 200),
                    "DEC": random.uniform(30, 80)
                }
            elif subdivision in ["WEST RAJASTHAN", "SAURASHTRA & KUTCH"]:
                # Low rainfall regions
                monthly_rainfall = {
                    "JAN": random.uniform(0, 10),
                    "FEB": random.uniform(0, 15),
                    "MAR": random.uniform(0, 20),
                    "APR": random.uniform(5, 25),
                    "MAY": random.uniform(10, 30),
                    "JUN": random.uniform(20, 60),
                    "JUL": random.uniform(50, 150),
                    "AUG": random.uniform(40, 120),
                    "SEP": random.uniform(20, 60),
                    "OCT": random.uniform(5, 25),
                    "NOV": random.uniform(0, 15),
                    "DEC": random.uniform(0, 10)
                }
            else:
                # Moderate rainfall regions
                monthly_rainfall = {
                    "JAN": random.uniform(5, 30),
                    "FEB": random.uniform(10, 40),
                    "MAR": random.uniform(15, 50),
                    "APR": random.uniform(30, 80),
                    "MAY": random.uniform(50, 150),
                    "JUN": random.uniform(100, 300),
                    "JUL": random.uniform(150, 400),
                    "AUG": random.uniform(120, 350),
                    "SEP": random.uniform(80, 250),
                    "OCT": random.uniform(40, 150),
                    "NOV": random.uniform(20, 80),
                    "DEC": random.uniform(10, 40)
                }
            
            # Calculate seasonal aggregates
            jan_feb = monthly_rainfall["JAN"] + monthly_rainfall["FEB"]
            mar_may = monthly_rainfall["MAR"] + monthly_rainfall["APR"] + monthly_rainfall["MAY"]
            jun_sep = monthly_rainfall["JUN"] + monthly_rainfall["JUL"] + monthly_rainfall["AUG"] + monthly_rainfall["SEP"]
            oct_dec = monthly_rainfall["OCT"] + monthly_rainfall["NOV"] + monthly_rainfall["DEC"]
            
            # Calculate annual rainfall
            annual = sum(monthly_rainfall.values())
            
            # Determine seasonal indicators
            current_month = random.choice(months)
            spring = 1 if current_month in ["MAR", "APR", "MAY"] else 0
            summer = 1 if current_month in ["JUN", "JUL", "AUG"] else 0
            monsoon = 1 if current_month in ["JUN", "JUL", "AUG", "SEP"] else 0
            autumn = 1 if current_month in ["SEP", "OCT", "NOV"] else 0
            winter = 1 if current_month in ["DEC", "JAN", "FEB"] else 0
            
            # Determine if it's raining today based on the month and region
            rain_probability = 0
            if monsoon == 1:
                rain_probability = 0.8
            elif summer == 1:
                rain_probability = 0.5
            elif spring == 1:
                rain_probability = 0.4
            elif autumn == 1:
                rain_probability = 0.3
            elif winter == 1:
                rain_probability = 0.2
                
            # Adjust for regional variations
            if subdivision in ["KERALA", "COASTAL KARNATAKA", "KONKAN & GOA", "ASSAM & MEGHALAYA"]:
                rain_probability += 0.2
            elif subdivision in ["WEST RAJASTHAN", "SAURASHTRA & KUTCH"]:
                rain_probability -= 0.2
                
            rain_today = 1 if random.random() < rain_probability else 0
            
            # Predict rain tomorrow with some correlation to rain today and seasonal factors
            rain_tomorrow_probability = rain_probability
            if rain_today == 1:
                rain_tomorrow_probability += 0.2
            else:
                rain_tomorrow_probability -= 0.1
                
            # Clamp probability between 0 and 1
            rain_tomorrow_probability = max(0, min(1, rain_tomorrow_probability))
            predicted_rain_tomorrow = 1 if random.random() < rain_tomorrow_probability else 0
            
            # Create row for this subdivision and year
            row = {
                "YEAR": year,
                "SUBDIVISION": subdivision,
                "JAN": monthly_rainfall["JAN"],
                "FEB": monthly_rainfall["FEB"],
                "MAR": monthly_rainfall["MAR"],
                "APR": monthly_rainfall["APR"],
                "MAY": monthly_rainfall["MAY"],
                "JUN": monthly_rainfall["JUN"],
                "JUL": monthly_rainfall["JUL"],
                "AUG": monthly_rainfall["AUG"],
                "SEP": monthly_rainfall["SEP"],
                "OCT": monthly_rainfall["OCT"],
                "NOV": monthly_rainfall["NOV"],
                "DEC": monthly_rainfall["DEC"],
                "Jan_Feb": jan_feb,
                "Mar_May": mar_may,
                "Jun_Sep": jun_sep,
                "Oct_Dec": oct_dec,
                "ANNUAL": annual,
                "SPRING": spring,
                "SUMMER": summer,
                "MONSOON": monsoon,
                "AUTUMN": autumn,
                "WINTER": winter,
                "RainToday": rain_today,
                "PredictedRainTomorrow": predicted_rain_tomorrow
            }
            
            # Add one-hot encoded subdivision
            for sub in subdivisions:
                row[f"SUBDIVISION_{sub}"] = 1 if sub == subdivision else 0
                
            data.append(row)
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    print(f"Generated synthetic dataset with {df.shape[0]} rows and {df.shape[1]} columns")
    return df

def get_rainfall_statistics():
    """
    Get general rainfall statistics for India from the dataset.
    Returns a dictionary with statistics or None if there was an error.
    """
    try:
        # Determine base directory using __file__ or fallback to cwd
        if "__file__" in globals():
            base_dir = Path(__file__).resolve().parent.parent
        else:
            base_dir = Path(os.getcwd())

        # Primary dataset path
        dataset_path = base_dir / "data" / "rain_predictions1.csv"
        print(f"Trying to load dataset from: {dataset_path}")

        # Check if the dataset exists
        if not dataset_path.exists():
            print(f"Dataset not found at: {dataset_path}")
            # Try fallback paths
            possible_paths = [
                Path("data/rain_predictions1.csv"),
                Path("../data/rain_predictions1.csv"),
                Path("app/data/rain_predictions1.csv"),
            ]
            for path in possible_paths:
                print(f"Checking fallback path: {path.resolve()}")
                if path.exists():
                    dataset_path = path
                    print(f"Found dataset at: {dataset_path}")
                    break
            else:
                print("Could not find dataset in any expected location.")
                return None

        # Load dataset
        print(f"Loading dataset from: {dataset_path.resolve()}")
        df = pd.read_csv(dataset_path)

        # Prepare statistics
        stats = {
            "total_records": len(df),
            "time_period": {
                "start_year": int(df["YEAR"].min()) if "YEAR" in df.columns else None,
                "end_year": int(df["YEAR"].max()) if "YEAR" in df.columns else None,
            },
            "overall_stats": {
                "mean_annual_rainfall": float(df["ANNUAL"].mean()) if "ANNUAL" in df.columns else None,
                "max_annual_rainfall": float(df["ANNUAL"].max()) if "ANNUAL" in df.columns else None,
                "min_annual_rainfall": float(df["ANNUAL"].min()) if "ANNUAL" in df.columns else None,
                "std_annual_rainfall": float(df["ANNUAL"].std()) if "ANNUAL" in df.columns else None,
            },
            "subdivisions": df["SUBDIVISION"].unique().tolist() if "SUBDIVISION" in df.columns else [],
        }

        # Add seasonal stats if all monthly columns exist
        months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
        if all(month in df.columns for month in months):
            stats["seasonal_stats"] = {
                "winter": float(df[["JAN", "FEB"]].sum(axis=1).mean()),
                "pre_monsoon": float(df[["MAR", "APR", "MAY"]].sum(axis=1).mean()),
                "monsoon": float(df[["JUN", "JUL", "AUG", "SEP"]].sum(axis=1).mean()),
                "post_monsoon": float(df[["OCT", "NOV", "DEC"]].sum(axis=1).mean()),
            }

        # Return as JSON serializable
        return json.loads(json.dumps(stats, default=str))

    except Exception as e:
        print(f"Error calculating rainfall statistics: {str(e)}")
        return None
def get_regional_data(subdivision):
    """Get regional data for a specific subdivision"""
    df = load_dataset()
    
    if df is None or df.empty:
        print("Dataset is empty or failed to load")
        return None
    
    # Check if we're dealing with a column name in the format "SUBDIVISION_Kerala"
    if subdivision.startswith("SUBDIVISION_"):
        # Extract the actual subdivision name
        col_name = subdivision
        subdivision = subdivision.replace("SUBDIVISION_", "")
        
        # First try looking for the exact column
        if col_name in df.columns:
            print(f"Found column: {col_name}")
            subdivision_data = df[df[col_name] == 1]
        else:
            print(f"Column {col_name} not found")
            # Try to find a matching column
            matching_cols = [col for col in df.columns if col.startswith("SUBDIVISION_") and subdivision in col]
            if matching_cols:
                print(f"Found matching column: {matching_cols[0]}")
                subdivision_data = df[df[matching_cols[0]] == 1]
            else:
                print(f"No matching column found for {subdivision}")
                return None
    else:
        # No prefix - first check if SUBDIVISION column exists
        if "SUBDIVISION" in df.columns:
            subdivision_data = df[df["SUBDIVISION"] == subdivision]
            if not subdivision_data.empty:
                print(f"Found data using SUBDIVISION column for {subdivision}")
            else:
                print(f"No data found in SUBDIVISION column for {subdivision}")
        else:
            # SUBDIVISION column doesn't exist, try one-hot columns
            print("SUBDIVISION column not found, trying one-hot columns")
            subdivision_data = pd.DataFrame()
        
        # If no data found or SUBDIVISION column doesn't exist, try finding the corresponding one-hot column
        if subdivision_data.empty:
            col_name = f"SUBDIVISION_{subdivision}"
            if col_name in df.columns:
                print(f"Using one-hot column: {col_name}")
                subdivision_data = df[df[col_name] == 1]
            else:
                # Try to find a matching column
                matching_cols = [col for col in df.columns if col.startswith("SUBDIVISION_") and subdivision in col]
                if matching_cols:
                    print(f"Found matching column: {matching_cols[0]}")
                    subdivision_data = df[df[matching_cols[0]] == 1]
                else:
                    print(f"No matching column found for {subdivision}")
                    return None
    
    if subdivision_data.empty:
        print(f"No data found for subdivision: {subdivision}")
        # Print available subdivisions for debugging
        print(f"Available one-hot columns: {[col for col in df.columns if col.startswith('SUBDIVISION_')]}")
        if "SUBDIVISION" in df.columns:
            print(f"Available subdivisions: {df['SUBDIVISION'].unique().tolist()}")
        return None
    
    print(f"Found {len(subdivision_data)} records for subdivision: {subdivision}")
    
    # Calculate monthly averages
    monthly_averages = {}
    for month in ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]:
        if month in subdivision_data.columns:
            monthly_averages[month] = float(subdivision_data[month].mean())
    
    # Determine seasonal pattern based on monthly averages
    if monthly_averages:
        max_month = max(monthly_averages, key=monthly_averages.get)
        min_month = min(monthly_averages, key=monthly_averages.get)
        
        monsoon_months = ["JUN", "JUL", "AUG", "SEP"]
        winter_months = ["DEC", "JAN", "FEB"]
        
        if max_month in monsoon_months:
            seasonal_pattern = f"{subdivision} receives most of its rainfall during the Southwest Monsoon season (June-September), with peak rainfall in {max_month}."
        elif max_month in ["OCT", "NOV"]:
            seasonal_pattern = f"{subdivision} receives significant rainfall during the Northeast Monsoon (October-December), with peak rainfall in {max_month}."
        else:
            seasonal_pattern = f"{subdivision} has an unusual rainfall pattern with peak rainfall in {max_month}."
    else:
        seasonal_pattern = f"No monthly data available for {subdivision}."
    
    # Calculate additional statistics
    annual_rainfall = float(subdivision_data['ANNUAL'].mean()) if 'ANNUAL' in subdivision_data.columns else 0
    
    # Calculate monsoon contribution percentage
    monsoon_rainfall_pct = 0
    if 'Jun_Sep' in subdivision_data.columns and annual_rainfall > 0:
        monsoon_rainfall_pct = float((subdivision_data['Jun_Sep'].mean() / annual_rainfall) * 100)
    
    # Get rain probability
    rain_probability = float(subdivision_data['PredictedRainTomorrow'].mean()) if 'PredictedRainTomorrow' in subdivision_data.columns else 0
    
    regional_data = {
        'subdivision': subdivision,
        'avg_annual_rainfall': annual_rainfall,
        'monsoon_rainfall_pct': monsoon_rainfall_pct,
        'rain_probability': rain_probability,
        'monthly_averages': monthly_averages,
        'seasonal_pattern': seasonal_pattern
    }
    
    # Get historical data for the recent years
    if 'YEAR' in subdivision_data.columns and 'ANNUAL' in subdivision_data.columns:
        recent_years = subdivision_data['YEAR'].unique().tolist()
        recent_years = [year for year in recent_years if 1901 <= year <= 2023]
        historical_data = []
        
        for year in recent_years:
            year_data = subdivision_data[subdivision_data['YEAR'] == year]
            if not year_data.empty:
                historical_data.append({
                    'year': int(year),
                    'annual_rainfall': float(year_data['ANNUAL'].iloc[0])
                })
        
        regional_data['historical_data'] = historical_data
    
    return regional_data
