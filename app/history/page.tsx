"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, Droplets, ThermometerSun, Wind } from "lucide-react"

export default function HistoryPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Mock historical data
  const getHistoricalData = (date: Date | undefined) => {
    if (!date) return null

    // Generate deterministic but seemingly random data based on the date
    const day = date.getDate()
    const month = date.getMonth() + 1
    const seed = day + month * 31

    const rainfall = ((seed * 17) % 100) / 10 // 0-10 mm
    const temperature = 15 + ((seed * 13) % 25) // 15-40°C
    const humidity = 40 + ((seed * 7) % 50) // 40-90%
    const windSpeed = 5 + ((seed * 11) % 20) // 5-25 km/h

    return {
      date: date.toLocaleDateString(),
      rainfall,
      temperature,
      humidity,
      windSpeed,
      prediction: {
        probability: (seed * 19) % 100, // 0-100%
        wasCorrect: (seed * 23) % 100 > 30, // 70% chance of being correct
      },
    }
  }

  const historicalData = getHistoricalData(date)

  return (
    <div className="container max-w-6xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Historical Data</h1>
        <p className="mt-2 text-muted-foreground">View past weather data and prediction accuracy</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Choose a date to view historical data</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </CardContent>
        </Card>

        {historicalData ? (
          <Card>
            <CardHeader>
              <CardTitle>Weather Data for {historicalData.date}</CardTitle>
              <CardDescription>Historical weather conditions and prediction accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Actual Weather Conditions</h3>

                  <div className="grid gap-4">
                    <div className="flex items-center gap-3">
                      <CloudRain className="h-5 w-5 text-sky-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Rainfall</div>
                        <div className="font-medium">{historicalData.rainfall.toFixed(1)} mm</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ThermometerSun className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Temperature</div>
                        <div className="font-medium">{historicalData.temperature.toFixed(1)}°C</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Humidity</div>
                        <div className="font-medium">{historicalData.humidity.toFixed(0)}%</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Wind className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-muted-foreground">Wind Speed</div>
                        <div className="font-medium">{historicalData.windSpeed.toFixed(1)} km/h</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Prediction Performance</h3>

                  <div className="rounded-lg bg-sky-50 p-4 dark:bg-sky-950">
                    <div className="mb-2 text-sm text-muted-foreground">Predicted Chance of Rain</div>
                    <div className="text-2xl font-bold text-sky-700 dark:text-sky-300">
                      {historicalData.prediction.probability}%
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${historicalData.prediction.wasCorrect ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <div className="text-sm font-medium">
                        {historicalData.prediction.wasCorrect ? "Prediction was correct" : "Prediction was incorrect"}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium">Accuracy Analysis</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {historicalData.prediction.wasCorrect
                        ? `Our model correctly predicted the rainfall for this day. The actual rainfall of ${historicalData.rainfall.toFixed(1)} mm aligned with our prediction probability of ${historicalData.prediction.probability}%.`
                        : `Our model's prediction was not accurate for this day. Despite predicting a ${historicalData.prediction.probability}% chance of rain, the actual rainfall was ${historicalData.rainfall.toFixed(1)} mm.`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex h-[400px] items-center justify-center">
              <p className="text-muted-foreground">Select a date to view historical data</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
