import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { subdivision } = await request.json()
    console.log("Fetching regional data for subdivision:", subdivision)

    if (!subdivision) {
      return NextResponse.json({ error: "Subdivision parameter is required" }, { status: 400 })
    }

    // Get the FastAPI URL from environment variables
    const apiUrl = process.env.FASTAPI_API_URL || "http://localhost:8000/regional-data"
    console.log("Fetching from:", apiUrl)

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subdivision: subdivision }),
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

    const regionalData = await response.json()
    console.log("Successfully fetched regional data:", regionalData)
    return NextResponse.json(regionalData)
  } catch (error) {
    console.error("Error fetching regional data:", error)

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