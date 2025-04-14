from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import traceback
from app.models.prediction import PredictionInput, PredictionOutput
from app.services.ml_model import MLModelService
from app.utils.data import get_rainfall_statistics

# Initialize FastAPI app
app = FastAPI(
    title="Rainfall Prediction API",
    description="API for predicting rainfall in India based on historical data",
    version="1.0.0"
)

# Add CORS middleware to allow requests from your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML model service
ml_service = MLModelService()

@app.on_event("startup")
async def startup_event():
    """Load the ML model on startup"""
    try:
        ml_service.load_model()
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model during startup: {e}")
        traceback.print_exc()

@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Welcome to the Rainfall Prediction API for India"}

@app.post("/predict", response_model=PredictionOutput)
def predict_rainfall(input_data: PredictionInput):
    """
    Predict rainfall based on input parameters
    """
    try:
        print(f"Received prediction request with data: {input_data.dict()}")
        
        # Calculate annual rainfall from monthly values if provided
        monthly_values = {
            'JAN': input_data.JAN,
            'FEB': input_data.FEB,
            'MAR': input_data.MAR,
            'APR': input_data.APR,
            'MAY': input_data.MAY,
            'JUN': input_data.JUN,
            'JUL': input_data.JUL,
            'AUG': input_data.AUG,
            'SEP': input_data.SEP,
            'OCT': input_data.OCT,
            'NOV': input_data.NOV,
            'DEC': input_data.DEC
        }
        
        # If any monthly values are provided, calculate annual
        if any(v is not None for v in monthly_values.values()):
            annual_rainfall = ml_service.calculate_annual_rainfall(monthly_values)
            input_data.ANNUAL = annual_rainfall
            print(f"Calculated annual rainfall: {annual_rainfall}")
        
        # Convert input data to a format the model can use
        features = ml_service.preprocess_input(input_data)
        
        # Make prediction
        prediction = ml_service.predict(features)
        print(f"Raw prediction value: {prediction}")
        
        # Get regional information
        regional_info = None
        subdivision = None
        for key, value in input_data.dict().items():
            if key.startswith('SUBDIVISION_') and value == 1:
                subdivision = key
                regional_info = ml_service.get_regional_info(subdivision)
                break
        
        # Determine confidence level
        confidence = "Medium"
        if prediction > 0.8 or prediction < 0.2:
            confidence = "High"
        elif prediction > 0.65 or prediction < 0.35:
            confidence = "Medium"
        else:
            confidence = "Low"
        
        # Add additional context based on the region and season
        if regional_info:
            avg_rain_prob = regional_info.get('rain_probability', 0.5)
            # Adjust prediction based on regional statistics
            # This helps make the predictions more realistic based on historical data
            adjusted_prediction = (prediction * 0.7) + (avg_rain_prob * 0.3)
            print(f"Adjusted prediction based on regional stats: {adjusted_prediction}")
            prediction = adjusted_prediction
        
        # Ensure prediction is within valid range
        prediction = max(0.0, min(1.0, prediction))
        
        # Boost prediction for high rainfall regions during monsoon
        high_rainfall_regions = ["KERALA", "COASTAL KARNATAKA", "KONKAN & GOA", "ASSAM & MEGHALAYA"]
        is_monsoon = any(input_data.dict().get(season, 0) == 1 for season in ["MONSOON"])
        is_high_rainfall_region = any(input_data.dict().get(f"SUBDIVISION_{region}", 0) == 1 for region in high_rainfall_regions)
        rain_today = input_data.dict().get("RainToday", 0) == 1
        
        if is_monsoon and is_high_rainfall_region:
            # Boost prediction for monsoon in high rainfall regions
            prediction = min(0.95, prediction * 1.3)
            print(f"Boosted prediction for high rainfall region during monsoon: {prediction}")
        
        if rain_today:
            # If it's raining today, slightly increase tomorrow's rain probability
            prediction = min(0.95, prediction * 1.15)
            print(f"Adjusted prediction based on current rain: {prediction}")
        
        # Add annual rainfall to regional_info if calculated
        if input_data.ANNUAL:
            if regional_info is None:
                regional_info = {}
            regional_info['calculated_annual_rainfall'] = input_data.ANNUAL
        
        return PredictionOutput(
            prediction=float(prediction),
            input_data=input_data,
            confidence=confidence,
            regional_info=regional_info
        )
    except Exception as e:
        print(f"Error in predict_rainfall: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def get_statistics():
    """Get general rainfall statistics for India"""
    stats = get_rainfall_statistics()
    if stats is None:
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")
    return stats

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": ml_service.model is not None}

if __name__ == "__main__":
    # Run the API with uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
