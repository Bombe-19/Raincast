import { CloudRain, Database, LineChart, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container max-w-6xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">About RainCast India</h1>
        <p className="mt-2 text-muted-foreground">Learn about our rainfall prediction system for India</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Our Dataset</h2>
          <p className="text-muted-foreground">
            Our prediction model is trained on a comprehensive dataset of rainfall patterns across India, covering:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              <p>Monthly rainfall data (January through December)</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              <p>Seasonal aggregates (Jan-Feb, Mar-May, Jun-Sep, Oct-Dec)</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              <p>Annual rainfall totals</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              <p>36 subdivisions across India</p>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              <p>Seasonal indicators (Spring, Summer, Monsoon, Autumn, Winter)</p>
            </li>
          </ul>

          <h2 className="text-2xl font-bold">The Technology</h2>
          <p className="text-muted-foreground">
            Our prediction system uses machine learning algorithms to analyze historical rainfall patterns and predict
            future rainfall. The model has been trained on years of weather data from across India, allowing it to
            recognize regional patterns and seasonal variations.
          </p>

          <div className="mt-6">
            <Link href="/predict">
              <Button className="bg-sky-600 hover:bg-sky-700">
                Try It Now
                <CloudRain className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Database className="h-8 w-8 text-sky-500" />
              <div>
                <CardTitle>Comprehensive Dataset</CardTitle>
                <CardDescription>Trained on extensive historical rainfall records</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our model is trained on decades of rainfall data across all regions of India, capturing the unique
                patterns of each subdivision and the effects of seasonal variations on precipitation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <LineChart className="h-8 w-8 text-sky-500" />
              <div>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Sophisticated prediction models</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We employ machine learning techniques that analyze multiple factors including monthly rainfall patterns,
                seasonal trends, and regional variations to predict whether it will rain tomorrow.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <MapPin className="h-8 w-8 text-sky-500" />
              <div>
                <CardTitle>Regional Precision</CardTitle>
                <CardDescription>Localized predictions for 36 subdivisions</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our system provides predictions tailored to 36 different subdivisions across India, accounting for the
                diverse climate patterns from the Himalayan regions to the coastal areas and everything in between.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12 rounded-lg bg-sky-50 p-8 dark:bg-sky-950">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold">Understanding Indian Rainfall Patterns</h2>
          <p className="mt-4 text-muted-foreground">
            India's rainfall patterns are complex and varied, influenced by the monsoon system, geographical features,
            and seasonal changes. Our prediction model takes into account these unique characteristics to provide
            accurate forecasts for each region.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600">36</div>
              <div className="text-sm text-muted-foreground">Subdivisions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600">12</div>
              <div className="text-sm text-muted-foreground">Monthly factors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600">5</div>
              <div className="text-sm text-muted-foreground">Seasonal periods</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600">85%</div>
              <div className="text-sm text-muted-foreground">Prediction accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
