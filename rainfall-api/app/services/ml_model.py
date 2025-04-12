import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from app.models.prediction import PredictionInput
from app.utils.data import load_dataset

class MLModelService:
    def __init__(self, model_path="./models/xgboost_model(1).pkl"):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.feature_columns = None
        self.feature_importances = None
        self.regional_stats = None
    
    def load_model(self):
        """Load the trained model or train a new one if it doesn't exist"""
        try:
            if os.path.exists(self.model_path):
                print(f"Loading model from {self.model_path}")
                model_data = joblib.load(self.model_path)
                self.model = model_data["model"]
                self.scaler = model_data["scaler"]
                self.feature_columns = model_data["feature_columns"]
                self.feature_importances = model_data.get("feature_importances", None)
                self.regional_stats = model_data.get("regional_stats", None)
            else:
                print("Model not found. Training a new model...")
                self.train_model()
        except Exception as e:
            print(f"Error loading model: {e}")
            self.train_model()
    
    def train_model(self):
        """Train a new model using the dataset"""
        # Load the dataset
        df = load_dataset()
        
        if df is None or df.empty:
            raise Exception("Failed to load dataset or dataset is empty")
        
        # Handle missing values in the training data
        df = df.fillna(0)
        
        # Calculate regional statistics for later use
        self.regional_stats = self._calculate_regional_stats(df)
        
        # Prepare features and target
        X = df.drop(["PredictedRainTomorrow"], axis=1, errors='ignore')
        y = df["PredictedRainTomorrow"]
        
        # Store feature columns for prediction
        self.feature_columns = X.columns.tolist()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)
        
        # Store feature importances
        self.feature_importances = dict(zip(X.columns, self.model.feature_importances_))
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        print(f"Model trained with metrics:")
        print(f"  Accuracy: {accuracy:.4f}")
        print(f"  Precision: {precision:.4f}")
        print(f"  Recall: {recall:.4f}")
        print(f"  F1 Score: {f1:.4f}")
        
        # Save model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump({
            "model": self.model,
            "scaler": self.scaler,
            "feature_columns": self.feature_columns,
            "feature_importances": self.feature_importances,
            "regional_stats": self.regional_stats
        }, self.model_path)
        print(f"Model saved to {self.model_path}")
    
    def _calculate_regional_stats(self, df):
        """Calculate regional statistics from the dataset"""
        regional_stats = {}
        
        # Get all subdivision columns
        subdivision_cols = [col for col in df.columns if col.startswith('SUBDIVISION_')]
        
        for col in subdivision_cols:
            region_name = col.replace('SUBDIVISION_', '')
            region_data = df[df[col] == 1]
            
            if not region_data.empty:
                regional_stats[region_name] = {
                    'avg_annual_rainfall': region_data['ANNUAL'].mean(),
                    'monsoon_rainfall_pct': (region_data['Jun-Sep'].mean() / region_data['ANNUAL'].mean()) * 100 if region_data['ANNUAL'].mean() > 0 else 0,
                    'rain_probability': region_data['PredictedRainTomorrow'].mean(),
                    'sample_count': len(region_data)
                }
        
        return regional_stats
    
    def preprocess_input(self, input_data: PredictionInput):
        """Convert input data to a format the model can use"""
        # Convert input to dictionary
        input_dict = input_data.dict()
        
        # Create a DataFrame with a single row
        input_df = pd.DataFrame([input_dict])
        
        # Ensure all feature columns are present
        for col in self.feature_columns:
            if col not in input_df.columns:
                input_df[col] = 0
        
        # Select only the columns used during training
        input_df = input_df[self.feature_columns]
        
        # Handle NaN values in the input data
        input_df = input_df.fillna(0)
        
        # Handle string 'NaN' values and empty strings
        for col in input_df.columns:
            # Convert 'NaN', 'nan', empty strings, etc. to numeric 0
            input_df[col] = input_df[col].apply(
                lambda x: 0 if (isinstance(x, str) and x.lower() in ['nan', 'null', '']) else x
            )
            
        # Double-check for any remaining NaN values
        if input_df.isna().any().any():
            print("Warning: NaN values found after conversion, filling with zeros")
            input_df = input_df.fillna(0)
        
        # Scale the features
        input_scaled = self.scaler.transform(input_df)
        
        return input_scaled
    
    def predict(self, features):
        """Make a prediction using the trained model"""
        if self.model is None:
            raise Exception("Model not loaded. Call load_model() first.")
        
        # Get prediction probability (probability of class 1)
        prediction_proba = self.model.predict_proba(features)[0, 1]
        
        return prediction_proba
    
    def get_regional_info(self, subdivision):
        """Get regional information for a specific subdivision"""
        if self.regional_stats is None:
            return None
        
        # Clean subdivision name to match keys in regional_stats
        clean_subdivision = subdivision.replace('SUBDIVISION_', '')
        
        return self.regional_stats.get(clean_subdivision, None)
    
    def get_feature_importance(self, feature_name):
        """Get the importance score for a specific feature"""
        if self.feature_importances is None:
            return None
        
        return self.feature_importances.get(feature_name, 0)