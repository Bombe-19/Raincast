import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Log the received data for debugging
    console.log("Received data:", data)

    // Forward the request to your FastAPI backend
    const apiUrl = process.env.FASTAPI_API_URL || "http://localhost:8000/predict"
    console.log("Sending request to:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      // Try to get the error message from the response
      let errorText = ""
      try {
        const errorData = await response.json()
        errorText = JSON.stringify(errorData)
      } catch (e) {
        errorText = await response.text()
      }

      console.error(`FastAPI error (${response.status}):`, errorText)
      throw new Error(`FastAPI responded with status: ${response.status}. Details: ${errorText}`)
    }

    const result = await response.json()
    console.log("FastAPI response:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in predict-rainfall API route:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to process prediction request";
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
