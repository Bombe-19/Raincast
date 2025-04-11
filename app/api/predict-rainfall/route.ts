import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    let data = await request.json()
    console.log("Original data:", data)

    // Preprocess the data to handle NaN values - this approach aligns with your ML model's preprocessing
    if (data && typeof data === 'object') {
      // Process input data to ensure no NaN values
      data = preprocessInputData(data)
    }

    console.log("Processed data:", data)

    // Forward the request to your FastAPI backend
    const apiUrl = process.env.FASTAPI_API_URL || "http://localhost:8000/predict"
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`FastAPI error: ${response.status} - ${errorText}`)
      return NextResponse.json({ 
        error: "Prediction failed", 
        details: errorText 
      }, { status: response.status })
    }
    
    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in predict-rainfall API route:", error)
    return NextResponse.json({ 
      error: "Failed to process prediction request",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

function preprocessInputData(data: any) {
  // Make a deep copy of the data to avoid modifying the original
  const processedData = JSON.parse(JSON.stringify(data))
  
  // Replace any NaN, undefined, null or empty string with 0
  for (const key in processedData) {
    const value = processedData[key]
    
    // Handle null, undefined, or NaN values
    if (value === null || value === undefined || 
        (typeof value === 'number' && isNaN(value)) ||
        (typeof value === 'string' && (value.toLowerCase() === 'nan' || value.trim() === ''))) {
      processedData[key] = 0
    } 
    // Ensure numeric strings are converted to numbers
    else if (typeof value === 'string' && !isNaN(Number(value))) {
      processedData[key] = Number(value)
    }
    // Handle other string values that might need special processing based on your model
    else if (typeof value === 'string') {
      // Keep string values as is - your FastAPI endpoint might handle categorical variables
      processedData[key] = value
    }
  }
  
  return processedData
}