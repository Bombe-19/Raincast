import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from app.models.prediction import PredictionInput
from app.utils.data import load_dataset

class MLModelService:
    def __init__(self, model_path="./models/xgboost_model.joblib"):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.feature_columns = None
   
    def load_model(self):
        """Load the trained model or train a new one if it doesn't exist"""
        try:
            if os.path.exists(self.model_path):
                print(f"Loading model from {self.model_path}")
                model_data = joblib.load(self.model_path)
                self.model = model_data["model"]
                self.scaler = model_data["scaler"]
                self.feature_columns = model_data["feature_columns"]
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
       
        # Prepare features and target
        X = df.drop(["PredictedRainTomorrow", "RainToday"], axis=1, errors='ignore')
        y = df["PredictedRainTomorrow"] if "PredictedRainTomorrow" in df.columns else df["RainToday"]
       
        # Handle missing values in training data
        X = X.fillna(0)
       
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
       
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"Model trained with accuracy: {accuracy:.4f}")
       
        # Save model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump({
            "model": self.model,
            "scaler": self.scaler,
            "feature_columns": self.feature_columns
        }, self.model_path)
        print(f"Model saved to {self.model_path}")
   
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
       
        # Handle NaN values by replacing them with 0
        input_df = input_df.fillna(0)
        
        # Convert any remaining problematic values
        for col in input_df.columns:
            # Convert any strings that could be interpreted as NaN
            input_df[col] = input_df[col].apply(
                lambda x: 0 if (isinstance(x, str) and x.lower() in ['nan', 'null', '']) else x
            )
            
            # Check for any remaining NaN values (e.g. from calculations or other sources)
            if pd.isna(input_df[col]).any():
                input_df[col] = input_df[col].fillna(0)
       
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