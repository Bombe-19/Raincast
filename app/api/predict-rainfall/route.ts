import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Log the received data for debugging
    console.log("Received data for prediction:", data)

    if (!data) {
      return NextResponse.json({ error: "Request body is required" }, { status: 400 })
    }

    // Transform the data to match the expected feature columns
    const transformedData = transformPayload(data)
    console.log("Transformed data for prediction:", transformedData)

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
      body: JSON.stringify(transformedData),
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

// Function to transform the payload to match the expected feature columns
function transformPayload(payload: Record<string, any>): Record<string, any> {
  const transformed: Record<string, any> = { ...payload }

  // 1. Fix seasonal aggregates format (replace underscores with hyphens)
  if ("Jan_Feb" in transformed) {
    transformed["Jan-Feb"] = transformed.Jan_Feb
    delete transformed.Jan_Feb
  } else {
    transformed["Jan-Feb"] = (transformed.JAN || 0) + (transformed.FEB || 0)
  }

  if ("Mar_May" in transformed) {
    transformed["Mar-May"] = transformed.Mar_May
    delete transformed.Mar_May
  } else {
    transformed["Mar-May"] = (transformed.MAR || 0) + (transformed.APR || 0) + (transformed.MAY || 0)
  }

  if ("Jun_Sep" in transformed) {
    transformed["Jun-Sep"] = transformed.Jun_Sep
    delete transformed.Jun_Sep
  } else {
    transformed["Jun-Sep"] =
      (transformed.JUN || 0) + (transformed.JUL || 0) + (transformed.AUG || 0) + (transformed.SEP || 0)
  }

  if ("Oct_Dec" in transformed) {
    transformed["Oct-Dec"] = transformed.Oct_Dec
    delete transformed.Oct_Dec
  } else {
    transformed["Oct-Dec"] = (transformed.OCT || 0) + (transformed.NOV || 0) + (transformed.DEC || 0)
  }

  // 2. Fix subdivision names (replace underscores with spaces and ampersands)
  const subdivisionMapping: Record<string, string> = {
    SUBDIVISION_ANDAMAN_NICOBAR_ISLANDS: "SUBDIVISION_ANDAMAN & NICOBAR ISLANDS",
    SUBDIVISION_ARUNACHAL_PRADESH: "SUBDIVISION_ARUNACHAL PRADESH",
    SUBDIVISION_ASSAM_MEGHALAYA: "SUBDIVISION_ASSAM & MEGHALAYA",
    SUBDIVISION_BIHAR: "SUBDIVISION_BIHAR",
    SUBDIVISION_CHHATTISGARH: "SUBDIVISION_CHHATTISGARH",
    SUBDIVISION_COASTAL_ANDHRA_PRADESH: "SUBDIVISION_COASTAL ANDHRA PRADESH",
    SUBDIVISION_COASTAL_KARNATAKA: "SUBDIVISION_COASTAL KARNATAKA",
    SUBDIVISION_EAST_MADHYA_PRADESH: "SUBDIVISION_EAST MADHYA PRADESH",
    SUBDIVISION_EAST_RAJASTHAN: "SUBDIVISION_EAST RAJASTHAN",
    SUBDIVISION_EAST_UTTAR_PRADESH: "SUBDIVISION_EAST UTTAR PRADESH",
    SUBDIVISION_GANGETIC_WEST_BENGAL: "SUBDIVISION_GANGETIC WEST BENGAL",
    SUBDIVISION_GUJARAT_REGION: "SUBDIVISION_GUJARAT REGION",
    SUBDIVISION_HARYANA_DELHI_CHANDIGARH: "SUBDIVISION_HARYANA DELHI & CHANDIGARH",
    SUBDIVISION_HIMACHAL_PRADESH: "SUBDIVISION_HIMACHAL PRADESH",
    SUBDIVISION_JAMMU_KASHMIR: "SUBDIVISION_JAMMU & KASHMIR",
    SUBDIVISION_JHARKHAND: "SUBDIVISION_JHARKHAND",
    SUBDIVISION_KERALA: "SUBDIVISION_KERALA",
    SUBDIVISION_KONKAN_GOA: "SUBDIVISION_KONKAN & GOA",
    SUBDIVISION_LAKSHADWEEP: "SUBDIVISION_LAKSHADWEEP",
    SUBDIVISION_MADHYA_MAHARASHTRA: "SUBDIVISION_MADHYA MAHARASHTRA",
    SUBDIVISION_MATATHWADA: "SUBDIVISION_MATATHWADA",
    SUBDIVISION_NAGA_MANI_MIZO_TRIPURA: "SUBDIVISION_NAGA MANI MIZO TRIPURA",
    SUBDIVISION_NORTH_INTERIOR_KARNATAKA: "SUBDIVISION_NORTH INTERIOR KARNATAKA",
    SUBDIVISION_ORISSA: "SUBDIVISION_ORISSA",
    SUBDIVISION_PUNJAB: "SUBDIVISION_PUNJAB",
    SUBDIVISION_RAYALSEEMA: "SUBDIVISION_RAYALSEEMA",
    SUBDIVISION_SAURASHTRA_KUTCH: "SUBDIVISION_SAURASHTRA & KUTCH",
    SUBDIVISION_SOUTH_INTERIOR_KARNATAKA: "SUBDIVISION_SOUTH INTERIOR KARNATAKA",
    SUBDIVISION_SUB_HIMALAYAN_WEST_BENGAL_SIKKIM: "SUBDIVISION_SUB HIMALAYAN WEST BENGAL & SIKKIM",
    SUBDIVISION_TAMIL_NADU: "SUBDIVISION_TAMIL NADU",
    SUBDIVISION_TELANGANA: "SUBDIVISION_TELANGANA",
    SUBDIVISION_UTTARAKHAND: "SUBDIVISION_UTTARAKHAND",
    SUBDIVISION_VIDARBHA: "SUBDIVISION_VIDARBHA",
    SUBDIVISION_WEST_MADHYA_PRADESH: "SUBDIVISION_WEST MADHYA PRADESH",
    SUBDIVISION_WEST_RAJASTHAN: "SUBDIVISION_WEST RAJASTHAN",
    SUBDIVISION_WEST_UTTAR_PRADESH: "SUBDIVISION_WEST UTTAR PRADESH",
  }

  // Apply the subdivision mapping
  Object.entries(subdivisionMapping).forEach(([oldKey, newKey]) => {
    if (oldKey in transformed) {
      transformed[newKey] = transformed[oldKey]
      delete transformed[oldKey]
    }
  })

  // If we have a SUBDIVISION field, set the corresponding one-hot encoded column
  if (transformed.SUBDIVISION) {
    // Format the subdivision name for the one-hot encoding
    const formattedSubdivision = transformed.SUBDIVISION.replace(/ /g, " ")
    const subdivisionKey = `SUBDIVISION_${formattedSubdivision}`

    // Initialize all subdivision columns to 0
    Object.values(subdivisionMapping).forEach((key) => {
      transformed[key] = 0
    })

    // Set the selected subdivision to 1
    const matchingKey = Object.values(subdivisionMapping).find(
      (key) => key === subdivisionKey || key.includes(transformed.SUBDIVISION),
    )

    if (matchingKey) {
      transformed[matchingKey] = 1
    } else {
      console.warn(`Could not find matching subdivision key for: ${transformed.SUBDIVISION}`)
    }
  }

  // 3. Add missing derived features
  // Calculate AvgMonthlyRainfall
  const monthlyValues = [
    transformed.JAN || 0,
    transformed.FEB || 0,
    transformed.MAR || 0,
    transformed.APR || 0,
    transformed.MAY || 0,
    transformed.JUN || 0,
    transformed.JUL || 0,
    transformed.AUG || 0,
    transformed.SEP || 0,
    transformed.OCT || 0,
    transformed.NOV || 0,
    transformed.DEC || 0,
  ]

  transformed.AvgMonthlyRainfall = monthlyValues.reduce((sum, val) => sum + val, 0) / 12

  // Calculate Rolling3MonthAvg (using the current month and previous 2 months)
  // This is a simplification - in a real model, you'd need to know which month is "current"
  // For now, we'll use the highest rainfall month as the "current" month
  const maxMonthIndex = monthlyValues.indexOf(Math.max(...monthlyValues))
  const prevMonth1 = (maxMonthIndex - 1 + 12) % 12
  const prevMonth2 = (maxMonthIndex - 2 + 12) % 12

  transformed.Rolling3MonthAvg =
    (monthlyValues[maxMonthIndex] + monthlyValues[prevMonth1] + monthlyValues[prevMonth2]) / 3

  // Set Lag_Annual to the current ANNUAL value (since we don't have previous year's data)
  transformed.Lag_Annual = transformed.ANNUAL || 0

  return transformed
}
