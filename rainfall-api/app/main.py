from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from app.models.prediction import PredictionInput, PredictionOutput
from app.services.ml_model import MLModelService
from app.utils.data import get_rainfall_statistics, get_regional_data

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
    ml_service.load_model()

@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Welcome to the Rainfall Prediction API for India"}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/check-backend")
def check_backend():
    """Check backend endpoint for Next.js compatibility"""
    return {"status": "healthy", "service": "rainfall-prediction-api"}

@app.get("/predict-rainfall/check-backend")
def predict_rainfall_check_backend():
    """Specific endpoint matching Next.js route"""
    return {"status": "healthy", "service": "rainfall-prediction-api"}

@app.post("/predict", response_model=PredictionOutput)
def predict_rainfall(input_data: PredictionInput):
    """
    Predict rainfall based on input parameters
    """
    try:
        # Convert input data to a format the model can use
        features = ml_service.preprocess_input(input_data)
        
        # Make prediction
        prediction = ml_service.predict(features)
        
        # Get regional information
        regional_info = None
        for key, value in input_data.dict().items():
            if key.startswith('SUBDIVISION_') and value == 1:
                subdivision = key.replace('SUBDIVISION_', '')
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
        
        return PredictionOutput(
            prediction=float(prediction),
            input_data=input_data,
            confidence=confidence,
            regional_info=regional_info
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats", response_class=JSONResponse)
def get_statistics():
    """
    Get general rainfall statistics for India.
    Returns:
        A dictionary of statistics or raises HTTPException on failure.
    """
    try:
        stats = get_rainfall_statistics()

        if not stats:
            raise HTTPException(status_code=404, detail="No statistics available")

        return {"success": True, "data": stats}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while retrieving statistics: {str(e)}"
        )

@app.post("/regional-data",response_class=JSONResponse)
def get_subdivision_data(data: dict):
    """Get regional data for a specific subdivision"""
    subdivision = data.get("subdivision")
    if not subdivision:
        raise HTTPException(status_code=400, detail="Subdivision is required")
    
    regional_data = get_regional_data(subdivision)
    if regional_data is None:
        raise HTTPException(status_code=404, detail=f"No data found for subdivision: {subdivision}")
    
    return regional_data

if __name__ == "__main__":
    # Run the API with uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)