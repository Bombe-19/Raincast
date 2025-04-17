import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { subdivision } = body

    if (!subdivision) {
      return NextResponse.json(
        { error: "Subdivision parameter is required" },
        { status: 400 }
      )
    }

    const baseUrl = process.env.FASTAPI_API_URL || "http://localhost:8000"
    const apiUrl = baseUrl.endsWith("/")
      ? `${baseUrl}regional-data`
      : `${baseUrl}/regional-data`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const fastapiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subdivision }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!fastapiResponse.ok) {
      const errorText = await fastapiResponse.text()
      return NextResponse.json(
        {
          error: "FastAPI error",
          statusCode: fastapiResponse.status,
          message: errorText || "Something went wrong in FastAPI backend",
        },
        { status: fastapiResponse.status }
      )
    }

    const data = await fastapiResponse.json()
    return NextResponse.json(data, { status: 200 })

  } catch (error) {
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
