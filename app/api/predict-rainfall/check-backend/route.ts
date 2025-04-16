import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the FastAPI URL from environment variables
    const baseUrl = process.env.FASTAPI_API_URL || "http://localhost:8000"
    
    // Try different endpoint paths based on the URL we're accessing from
    const endpoints = [
      "/health",
      "/check-backend",
      "/predict-rainfall/check-backend"
    ]
    
    // Log the base URL for debugging
    console.log("FastAPI base URL:", baseUrl)
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      const url = baseUrl.endsWith("/") ? `${baseUrl}${endpoint.substring(1)}` : `${baseUrl}${endpoint}`
      console.log("Trying endpoint:", url)
      
      try {
        // Add a timeout to the fetch request
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const result = await response.json()
          
          // Return successful response
          return NextResponse.json({
            status: "success",
            message: "FastAPI backend is running",
            backendStatus: result,
            backendUrl: baseUrl,
            endpoint: url
          })
        }
      } catch (endpointError) {
        console.log(`Failed to reach endpoint ${url}:`, endpointError)
        // Continue to the next endpoint
      }
    }
    
    // If all endpoints failed
    throw new Error("Failed to connect to any FastAPI backend endpoint")
    
  } catch (error) {
    console.error("Error checking FastAPI backend:", error)
    
    // Handle timeout errors
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          status: "error",
          error: "Request timed out. The FastAPI backend might not be running or is unreachable.",
          details: error.message,
          tip: "Make sure your FastAPI server is running at the URL specified in FASTAPI_API_URL environment variable.",
        },
        { status: 504 }
      )
    }
    
    // Handle other errors
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Failed to check FastAPI health",
        tip: "Check if your FastAPI server is running and FASTAPI_API_URL is set correctly.",
      },
      { status: 500 }
    )
  }
}