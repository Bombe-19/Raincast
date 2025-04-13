import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.impute import SimpleImputer
from app.models.prediction import PredictionInput
from app.utils.data import load_dataset

class MLModelService:
    def __init__(self, model_path="./models/xgboost_model.joblib"):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.imputer = None
        self.feature_columns = None
        self.feature_importances = None
        self.regional_stats = None
        self.dataset = None
    
    def load_model(self):
        """Load the trained model or train a new one if it doesn't exist"""
        try:
            # First, load the dataset for potential imputer fitting
            self.dataset = load_dataset()
            if self.dataset is None or self.dataset.empty:
                raise Exception("Failed to load dataset or dataset is empty")
            
            if os.path.exists(self.model_path):
                print(f"Loading model from {self.model_path}")
                model_data = joblib.load(self.model_path)
                self.model = model_data["model"]
                self.scaler = model_data["scaler"]
                self.feature_columns = model_data["feature_columns"]
                self.feature_importances = model_data.get("feature_importances", None)
                self.regional_stats = model_data.get("regional_stats", None)
                
                # Check if imputer exists in the saved model
                if "imputer" in model_data and model_data["imputer"] is not None:
                    self.imputer = model_data["imputer"]
                    print("Loaded imputer from model file")
                else:
                    # Create and fit a new imputer if not in the saved model
                    print("Imputer not found in model file. Creating and fitting a new one.")
                    self._create_and_fit_imputer()
            else:
                print("Model not found. Training a new model...")
                self.train_model()
        except Exception as e:
            print(f"Error loading model: {e}")
            import traceback
            traceback.print_exc()
            # Try to train a new model if loading fails
            try:
                self.train_model()
            except Exception as train_error:
                print(f"Error training new model: {train_error}")
                traceback.print_exc()
                raise
    
    def _create_and_fit_imputer(self):
        """Create and fit a new imputer using the loaded dataset"""
        try:
            if self.dataset is None or self.dataset.empty:
                raise Exception("Dataset not available for fitting imputer")
            
            # Get features (all columns except target)
            X = self.dataset.drop(["PredictedRainTomorrow"], axis=1, errors='ignore')
            
            # Create and fit the imputer
            self.imputer = SimpleImputer(strategy='mean')
            self.imputer.fit(X)
            print("Successfully created and fitted new imputer")
        except Exception as e:
            print(f"Error creating and fitting imputer: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    def train_model(self):
        """Train a new model using the dataset"""
        # Load the dataset if not already loaded
        if self.dataset is None or self.dataset.empty:
            self.dataset = load_dataset()
        
        if self.dataset is None or self.dataset.empty:
            raise Exception("Failed to load dataset or dataset is empty")
        
        # Calculate regional statistics for later use
        self.regional_stats = self._calculate_regional_stats(self.dataset)
        
        # Prepare features and target
        X = self.dataset.drop(["PredictedRainTomorrow"], axis=1, errors='ignore')
        y = self.dataset["PredictedRainTomorrow"]
        
        # Store feature columns for prediction
        self.feature_columns = X.columns.tolist()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Create and fit imputer for handling missing values
        self.imputer = SimpleImputer(strategy='mean')
        X_train_imputed = self.imputer.fit_transform(X_train)
        X_test_imputed = self.imputer.transform(X_test)
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train_imputed)
        X_test_scaled = self.scaler.transform(X_test_imputed)
        
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
            "imputer": self.imputer,
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
        # Ensure imputer is available
        if self.imputer is None:
            print("Imputer not available. Creating and fitting a new one.")
            self._create_and_fit_imputer()
        
        # Convert input to dictionary
        input_dict = input_data.dict()
        
        # Create a DataFrame with a single row
        input_df = pd.DataFrame([input_dict])
        
        # Print the columns in input_df for debugging
        print("Input columns:", input_df.columns.tolist())
        print("Feature columns:", self.feature_columns)
        
        # Ensure all feature columns are present
        for col in self.feature_columns:
            if col not in input_df.columns:
                print(f"Adding missing column: {col}")
                input_df[col] = 0
        
        # Select only the columns used during training and in the same order
        input_df = input_df[self.feature_columns]
        
        # Check for NaN values before imputation
        if input_df.isna().any().any():
            print("Warning: NaN values detected in input data before imputation")
            print("NaN columns:", input_df.columns[input_df.isna().any()].tolist())
        
        # Fill missing values using the imputer
        try:
            # Convert to numpy array without column names to avoid feature name mismatch
            input_array = input_df.values
            input_imputed = self.imputer.transform(input_array)
        except Exception as e:
            print(f"Error during imputation: {e}")
            # Fallback: replace NaN with 0
            input_df = input_df.fillna(0)
            input_array = input_df.values
            input_imputed = input_array
        
        # Scale the features
        try:
            input_scaled = self.scaler.transform(input_imputed)
        except Exception as e:
            print(f"Error during scaling: {e}")
            # Fallback: use the array as is
            input_scaled = input_imputed
        
        # Final check for NaN values and replace them
        if np.isnan(input_scaled).any():
            print("Warning: NaN values detected after preprocessing")
            input_scaled = np.nan_to_num(input_scaled, nan=0.0)
        
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
    
    def calculate_annual_rainfall(self, monthly_values):
        """Calculate annual rainfall from monthly values"""
        # Sum all monthly values
        annual = sum(value for value in monthly_values.values() if value is not None)
        return annual
