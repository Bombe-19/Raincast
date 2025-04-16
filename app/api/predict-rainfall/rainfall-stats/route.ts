import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the FastAPI URL from environment variables
    const baseUrl = process.env.FASTAPI_API_URL || "http://localhost:8000"
    const statsUrl = baseUrl.endsWith("/") ? `${baseUrl}stats` : `${baseUrl}/stats`
    
    console.log("Fetching rainfall statistics from:", statsUrl)
    
    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(statsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      cache: "no-store", // Ensure we're not getting a cached response
    })
    clearTimeout(timeoutId)
    
    // Log response status for debugging
    console.log("Response status:", response.status)
    
    if (!response.ok) {
      // Get the response text first and store it
      const responseText = await response.text()
      console.log("Raw error response:", responseText)
      
      let errorText = responseText
      
      // Try to parse it as JSON if possible
      try {
        const errorData = JSON.parse(responseText)
        errorText = JSON.stringify(errorData)
      } catch (e) {
        // If it's not valid JSON, just use the text as is
      }
      
      console.error(`FastAPI error (${response.status}):`, errorText)
      throw new Error(`FastAPI responded with status: ${response.status}. Details: ${errorText}`)
    }
    
    const stats = await response.json()
    console.log("Successfully fetched rainfall statistics:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching rainfall statistics:", error)
    
    // Return a more informative error response
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
    
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Failed to fetch rainfall statistics",
        tip: "Check if your FastAPI server is running and the '/stats' endpoint is implemented correctly.",
        solution: "Make sure your get_rainfall_statistics() function in your FastAPI app returns proper data.",
      },
      { status: 500 }
    )
  }
}