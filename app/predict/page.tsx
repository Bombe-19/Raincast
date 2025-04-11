"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CloudRain, Droplets, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

// Define the subdivisions from your dataset
const SUBDIVISIONS = [
  "ANDAMAN & NICOBAR ISLANDS",
  "ARUNACHAL PRADESH",
  "ASSAM & MEGHALAYA",
  "BIHAR",
  "CHHATTISGARH",
  "COASTAL ANDHRA PRADESH",
  "COASTAL KARNATAKA",
  "EAST MADHYA PRADESH",
  "EAST RAJASTHAN",
  "EAST UTTAR PRADESH",
  "GANGETIC WEST BENGAL",
  "GUJARAT REGION",
  "HARYANA DELHI & CHANDIGARH",
  "HIMACHAL PRADESH",
  "JAMMU & KASHMIR",
  "JHARKHAND",
  "KERALA",
  "KONKAN & GOA",
  "LAKSHADWEEP",
  "MADHYA MAHARASHTRA",
  "MATATHWADA",
  "NAGA MANI MIZO TRIPURA",
  "NORTH INTERIOR KARNATAKA",
  "ORISSA",
  "PUNJAB",
  "RAYALSEEMA",
  "SAURASHTRA & KUTCH",
  "SOUTH INTERIOR KARNATAKA",
  "SUB HIMALAYAN WEST BENGAL & SIKKIM",
  "TAMIL NADU",
  "TELANGANA",
  "UTTARAKHAND",
  "VIDARBHA",
  "WEST MADHYA PRADESH",
  "WEST RAJASTHAN",
  "WEST UTTAR PRADESH",
]

const MONTHS = [
  { value: "JAN", label: "January" },
  { value: "FEB", label: "February" },
  { value: "MAR", label: "March" },
  { value: "APR", label: "April" },
  { value: "MAY", label: "May" },
  { value: "JUN", label: "June" },
  { value: "JUL", label: "July" },
  { value: "AUG", label: "August" },
  { value: "SEP", label: "September" },
  { value: "OCT", label: "October" },
  { value: "NOV", label: "November" },
  { value: "DEC", label: "December" },
]

const SEASONS = [
  { value: "SPRING", label: "Spring" },
  { value: "SUMMER", label: "Summer" },
  { value: "MONSOON", label: "Monsoon" },
  { value: "AUTUMN", label: "Autumn" },
  { value: "WINTER", label: "Winter" },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

const formSchema = z.object({
  year: z.number().min(1900).max(2100),
  month: z.string().min(1),
  subdivision: z.string().min(1),
  avgMonthlyRainfall: z.number().optional(),
  season: z.string().min(1),
})

export default function PredictPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<null | { willRain: boolean; probability: number }>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: currentYear,
      month: "JUN",
      subdivision: "KERALA",
      avgMonthlyRainfall: undefined,
      season: "MONSOON",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Create a payload that matches your FastAPI endpoint's expected input
      const payload = {
        YEAR: values.year,
        [values.month]: values.avgMonthlyRainfall, // Set the selected month's rainfall
        [`SUBDIVISION_${values.subdivision}`]: 1, // Set the selected subdivision to 1 (one-hot encoding)
        [values.season]: 1, // Set the selected season to 1
      }

      // Add all subdivisions with 0 except the selected one
      SUBDIVISIONS.forEach((sub) => {
        if (sub !== values.subdivision) {
          payload[`SUBDIVISION_${sub}`] = 0
        }
      })

      // Add all seasons with 0 except the selected one
      SEASONS.forEach((season) => {
        if (season.value !== values.season) {
          payload[season.value] = 0
        }
      })

      console.log("Sending payload to API:", payload)

      // Make the API call to your FastAPI backend
      const response = await fetch("/api/predict-rainfall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log("API response:", data)

      // Set the prediction based on the API response
      setPrediction({
        willRain: data.prediction > 0.5, // Assuming the API returns a probability
        probability: Math.round(data.prediction * 100),
      })

      toast({
        title: "Prediction complete",
        description: "Your rainfall prediction has been calculated.",
      })
    } catch (error) {
      console.error("Error making prediction:", error)
      toast({
        title: "Something went wrong",
        description: "Failed to get prediction. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-6xl py-10">
      <div className="mb-8 flex items-center gap-2">
        <CloudRain className="h-6 w-6 text-sky-500" />
        <h1 className="text-3xl font-bold">Rainfall Prediction</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter Weather Data</CardTitle>
            <CardDescription>Provide details to predict rainfall for your region</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Year
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subdivision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Region
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUBDIVISIONS.map((subdivision) => (
                            <SelectItem key={subdivision} value={subdivision}>
                              {subdivision}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="avgMonthlyRainfall"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Droplets className="h-4 w-4" /> Average Monthly Rainfall (mm)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter average rainfall"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value === undefined ? "" : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select season" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SEASONS.map((season) => (
                            <SelectItem key={season.value} value={season.value}>
                              {season.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Calculating..." : "Predict Rainfall"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Prediction Results</CardTitle>
              <CardDescription>Rainfall prediction based on your inputs</CardDescription>
            </CardHeader>
            <CardContent>
              {prediction ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative h-48 w-48">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl font-bold text-sky-600">{prediction.probability}%</div>
                      </div>
                      <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle
                          className="stroke-slate-200 dark:stroke-slate-700"
                          cx="50"
                          cy="50"
                          r="40"
                          strokeWidth="10"
                          fill="none"
                        />
                        <circle
                          className="stroke-sky-500"
                          cx="50"
                          cy="50"
                          r="40"
                          strokeWidth="10"
                          fill="none"
                          strokeDasharray={`${prediction.probability * 2.51} 251`}
                          strokeDashoffset="0"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold">Chance of Rain Tomorrow</h3>
                      <p className="text-muted-foreground">Probability of precipitation</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-sky-50 p-4 dark:bg-sky-950">
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-5 w-5 text-sky-600" />
                      <h3 className="font-medium">Prediction</h3>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-sky-700 dark:text-sky-300">
                      {prediction.willRain ? "Rain Expected" : "No Rain Expected"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
                  <CloudRain className="mb-2 h-10 w-10 opacity-50" />
                  <p>Enter details and click "Predict Rainfall" to see results</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About the Prediction Model</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This prediction model is trained on historical rainfall data across different regions of India. It takes
                into account:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                  <p>Monthly and seasonal rainfall patterns</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                  <p>Regional variations across 36 subdivisions</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                  <p>Year-over-year rainfall trends</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                  <p>Seasonal factors affecting precipitation</p>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                The model predicts whether it will rain tomorrow based on the provided inputs.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
