from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from app.models.prediction import PredictionInput, PredictionOutput
from app.services.ml_model import MLModelService

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
    return {"message": "Welcome to the Rainfall Prediction API"}

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
        
        return PredictionOutput(
            prediction=float(prediction),
            input_data=input_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    # Run the API with uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)