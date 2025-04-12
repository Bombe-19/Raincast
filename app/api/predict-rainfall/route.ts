import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    let data = await request.json()
    // Log the received data for debugging
    console.log("Received data:", data)

    // Clean NaN values from the data
    data = cleanInputData(data)
    console.log("Cleaned data:", data)

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
      const errorResponse = await response.text()
      console.error(`FastAPI error: ${response.status}`, errorResponse)
      return NextResponse.json({ 
        error: "Failed to process prediction request", 
        details: errorResponse 
      }, { status: response.status })
    }
    
    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in predict-rainfall API route:", error)
    return NextResponse.json({ 
      error: "Failed to process prediction request",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// Function to clean NaN values from input data
function cleanInputData(data: any): any {
  // If data is null or undefined, return default object
  if (data === null || data === undefined) {
    return {}
  }

  // If data is an array, clean each item
  if (Array.isArray(data)) {
    return data.map(item => cleanInputData(item))
  }

  // If data is not an object, check for NaN
  if (typeof data !== 'object') {
    // Handle NaN values
    if (typeof data === 'number' && isNaN(data)) {
      return 0 // Replace NaN with 0
    }
    // Handle 'NaN' strings
    if (typeof data === 'string' && (data.toLowerCase() === 'nan' || data === '')) {
      return 0
    }
    return data
  }

  // Handle object - create a new object with cleaned values
  const cleanedData: Record<string, any> = {}
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key]
      
      // Handle NaN, null, undefined values
      if (value === null || value === undefined || 
          (typeof value === 'number' && isNaN(value)) ||
          (typeof value === 'string' && (value.toLowerCase() === 'nan' || value === ''))) {
        cleanedData[key] = 0 // Replace with 0
      } else if (typeof value === 'object') {
        // Recursively clean nested objects
        cleanedData[key] = cleanInputData(value)
      } else {
        cleanedData[key] = value
      }
    }
  }
  
  return cleanedData
}