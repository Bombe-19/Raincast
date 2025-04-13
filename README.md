![alt text](/public/images/rui.png)

# Raincast
Raincast is a web-based platform that predicts rainfall patterns based on regional, and seasonal data using machine learning models. Built with **Next.js (frontend)** and **FastAPI (backend)**, it uses a historical rainfall dataset to deliver accurate rainfall predictions for different subdivisions of India.

## Features
- Predict rainfall based on month, year, and region
- One-hot encoded location-based prediction (36 subdivisions)
- Trained ML models with accuracy and evaluation metrics
- Backend powered by FastAPI with ML model integration
- API endpoint for real-time prediction

## Machine Learning Model
- **Model Used:** Random Forest Classifier / XGBoost
- **Data:** Monthly rainfall data (1901–2015) from 36 Indian subdivisions
- **Target:** `RainToday` (0 or 1)
- **Features:**
  - Year & Month
  - Subdivision (One-hot encoded)
  - Seasonal indicators (Monsoon, Summer, Winter, etc.)
  - Monthly rainfall data (JAN–DEC)

## Setup Instructions

### 1. Clone the repository

```bash
git clone 
cd raincast
```
### 2. Backend – FastAPI
```bash
cd rainfall-api
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
### 3.Frontend - Next JS
```bash
cd raincast
npm install
npm run dev
```


