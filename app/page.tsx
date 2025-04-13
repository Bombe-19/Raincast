import Link from "next/link"
import { CloudRain, Droplets, MapPin, CloudLightning, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center text-xl font-bold">
            <CloudRain className="h-6 w-6 text-sky-500" />
            <span>RainCast</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                About
              </Link>
              <Link
                href="/history"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                History
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Predict Rainfall Across India
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Get accurate rainfall predictions for any region in India using our machine learning model
                    trained on historical weather data.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/predict">
                    <Button className="bg-sky-600 hover:bg-sky-700">
                      Make a Prediction
                      <Droplets className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline">Learn More</Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] rounded-full bg-gradient-to-b from-sky-200 to-sky-400 dark:from-sky-800 dark:to-sky-600 flex items-center justify-center">
                  <CloudLightning className="h-32 w-32 text-white" />
                  <div className="absolute -bottom-6 w-full text-center">
                    <div className="inline-block rounded-full bg-white px-4 py-2 shadow-lg dark:bg-slate-800">
                      <p className="text-sm font-medium">Rainfall Prediction</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Our rainfall prediction system uses advanced machine learning algorithms trained on historical weather
                data from across India to provide accurate forecasts.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="overflow-hidden">
                <div className="h-2 bg-sky-500"></div>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900">
                    <MapPin className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Select Your Region</h3>
                  <p className="text-muted-foreground">
                    Choose from 36 subdivisions across India for localized predictions tailored to your specific area.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="h-2 bg-blue-500"></div>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Analyze Patterns</h3>
                  <p className="text-muted-foreground">
                    Our model analyzes historical rainfall data, seasonal patterns, and regional variations to identify
                    trends.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="h-2 bg-indigo-500"></div>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <CloudRain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">Get Predictions</h3>
                  <p className="text-muted-foreground">
                    Receive detailed rainfall predictions with probability estimates and confidence levels for tomorrow.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-sky-50 dark:bg-sky-950">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div>
                <h2 className="mb-4 text-3xl font-bold">India's Diverse Rainfall Patterns</h2>
                <p className="mb-4 text-muted-foreground">
                  India experiences a wide variety of rainfall patterns across its diverse geography:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                    <p className="text-muted-foreground">
                      <strong>Southwest Monsoon (Jun-Sep):</strong> Brings 80% of India's annual rainfall
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                    <p className="text-muted-foreground">
                      <strong>Northeast Monsoon (Oct-Dec):</strong> Critical for Tamil Nadu and parts of Andhra Pradesh
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                    <p className="text-muted-foreground">
                      <strong>Western Disturbances (Dec-Feb):</strong> Bring winter rainfall to northern India
                    </p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                    <p className="text-muted-foreground">
                      <strong>Pre-Monsoon Showers (Mar-May):</strong> Affect eastern and northeastern states
                    </p>
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-800">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-sky-600">3,000mm+</div>
                    <p className="text-sm text-muted-foreground">Annual rainfall in Northeast India</p>
                  </div>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-800">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">~500mm</div>
                    <p className="text-sm text-muted-foreground">Annual rainfall in Western Rajasthan</p>
                  </div>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-800">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">36</div>
                    <p className="text-sm text-muted-foreground">Meteorological subdivisions</p>
                  </div>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-slate-800">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">4</div>
                    <p className="text-sm text-muted-foreground">Major seasonal patterns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-slate-50 dark:bg-slate-900">
        <div className="container flex flex-col gap-2 py-6 md:flex-row md:items-center md:justify-between md:py-8">
          <div className="flex flex-col gap-2">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              © {new Date().getFullYear()} RainCast India. All rights reserved.
            </p>
          </div>
          <nav className="flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground md:justify-end">
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
