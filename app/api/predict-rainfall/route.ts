import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Log the received data for debugging
    console.log("Received data for prediction:", data)

    if (!data) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 })
    }

    // Forward the request to your FastAPI backend
    const apiUrl = process.env.FASTAPI_API_URL || "http://localhost:8000/predict"
    console.log("Sending prediction request to:", apiUrl)

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout for predictions

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // Get the response text first and store it
      const responseText = await response.text()
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

    const result = await response.json()
    console.log("FastAPI prediction response:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in predict-rainfall API route:", error)

    // Return a more informative error response
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Request timed out. The FastAPI backend might not be running or is unreachable.",
          details: error.message,
          tip: "Make sure your FastAPI server is running at the URL specified in FASTAPI_API_URL environment variable.",
        },
        { status: 504 },
      )
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch regional data",
        tip: "Check if your FastAPI server is running and FASTAPI_API_URL is set correctly.",
      },
      { status: 500 },
    )
  }
}