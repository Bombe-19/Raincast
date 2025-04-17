import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the FastAPI URL from environment variables
    const apiUrl = process.env.FASTAPI_API_URL || "http://localhost:8000/stats"
    console.log("Fetching rainfall statistics from:", apiUrl)

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // Try to get more detailed error information
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

    const stats = await response.json()
    console.log("Successfully fetched rainfall statistics:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching rainfall statistics:", error)

    // Return a more informative error response
   if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Request to FastAPI timed out",
          tip: "Ensure FastAPI server is up and accessible at FASTAPI_API_URL",
        },
        { status: 504 }
      )
    }

    return NextResponse.json(
      {
        error: "Something went wrong while fetching regional data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
