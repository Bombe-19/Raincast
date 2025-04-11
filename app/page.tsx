import Link from "next/link"
import { CloudRain, Droplets, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center text-xl font-bold">
            <CloudRain className="h-6 w-6 text-sky-500" />
            <span>RainCast India</span>
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Predict Rainfall Across India
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Get accurate rainfall predictions for any region in India using our advanced machine learning model
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
                  <MapPin className="h-32 w-32 text-white" />
                  <div className="absolute -bottom-6 w-full text-center">
                    <div className="inline-block rounded-full bg-white px-4 py-2 shadow-lg dark:bg-slate-800">
                      <p className="text-sm font-medium">36 Regions Across India</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our rainfall prediction system uses advanced machine learning algorithms trained on historical
                    weather data from across India to provide accurate forecasts.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-800">
                      <span className="font-bold text-sky-600 dark:text-sky-200">1</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">Select Your Region</h3>
                      <p className="text-muted-foreground">
                        Choose from 36 subdivisions across India for localized predictions.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-800">
                      <span className="font-bold text-sky-600 dark:text-sky-200">2</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">Enter Weather Parameters</h3>
                      <p className="text-muted-foreground">Provide details like month, season, and average rainfall.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-800">
                      <span className="font-bold text-sky-600 dark:text-sky-200">3</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">Get Accurate Predictions</h3>
                      <p className="text-muted-foreground">
                        Receive detailed rainfall predictions with probability estimates.
                      </p>
                    </div>
                  </li>
                </ul>
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
