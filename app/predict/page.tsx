"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CloudRain, Calendar, MapPin, BarChart, Umbrella, CloudLightning } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  { value: "SPRING", label: "Spring (Mar-May)" },
  { value: "SUMMER", label: "Summer (Jun-Aug)" },
  { value: "MONSOON", label: "Monsoon (Jun-Sep)" },
  { value: "AUTUMN", label: "Autumn (Sep-Nov)" },
  { value: "WINTER", label: "Winter (Dec-Feb)" },
]

// Group subdivisions by region for better organization
const SUBDIVISION_GROUPS = {
  "North India": [
    "JAMMU & KASHMIR",
    "HIMACHAL PRADESH",
    "UTTARAKHAND",
    "PUNJAB",
    "HARYANA DELHI & CHANDIGARH",
    "WEST UTTAR PRADESH",
    "EAST UTTAR PRADESH",
  ],
  "Central India": [
    "EAST MADHYA PRADESH",
    "WEST MADHYA PRADESH",
    "EAST RAJASTHAN",
    "WEST RAJASTHAN",
    "CHHATTISGARH",
    "VIDARBHA",
  ],
  "East India": ["BIHAR", "JHARKHAND", "GANGETIC WEST BENGAL", "SUB HIMALAYAN WEST BENGAL & SIKKIM", "ORISSA"],
  "Northeast India": ["ARUNACHAL PRADESH", "ASSAM & MEGHALAYA", "NAGA MANI MIZO TRIPURA"],
  "West India": ["GUJARAT REGION", "SAURASHTRA & KUTCH", "KONKAN & GOA", "MADHYA MAHARASHTRA", "MATATHWADA"],
  "South India": [
    "COASTAL ANDHRA PRADESH",
    "TELANGANA",
    "RAYALSEEMA",
    "TAMIL NADU",
    "COASTAL KARNATAKA",
    "NORTH INTERIOR KARNATAKA",
    "SOUTH INTERIOR KARNATAKA",
    "KERALA",
  ],
  "Island Territories": ["ANDAMAN & NICOBAR ISLANDS", "LAKSHADWEEP"],
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

const formSchema = z.object({
  year: z.number().min(1900).max(2100),
  month: z.string().min(1),
  subdivision: z.string().min(1),
  season: z.string().min(1),
  rainToday: z.string(),
})

export default function PredictPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<null | { willRain: boolean; probability: number; confidence: string }>(
    null,
  )
  const [activeTab, setActiveTab] = useState("basic")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: currentYear,
      month: new Date().toLocaleString("en-US", { month: "short" }).toUpperCase(),
      subdivision: "KERALA",
      season: "MONSOON",
      rainToday: "yes",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Create a payload that matches your FastAPI endpoint's expected input
      const payload = {
        YEAR: values.year,
        [values.month]: 1, // Set the selected month to 1 to indicate it's the current month
        [`SUBDIVISION_${values.subdivision}`]: 1, // Set the selected subdivision to 1 (one-hot encoding)
        [values.season]: 1, // Set the selected season to 1
        RainToday: values.rainToday === "yes" ? 1 : 0,
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
      const probability = Math.round(data.prediction * 100)
      let confidence = "Low"
      if (probability > 80 || probability < 20) {
        confidence = "High"
      } else if (probability > 65 || probability < 35) {
        confidence = "Medium"
      }

      setPrediction({
        willRain: data.prediction > 0.5, // Assuming the API returns a probability
        probability: probability,
        confidence: confidence,
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

  // Get the current subdivision's region
  const getCurrentRegion = (subdivision: string) => {
    for (const [region, subdivisions] of Object.entries(SUBDIVISION_GROUPS)) {
      if (subdivisions.includes(subdivision)) {
        return region
      }
    }
    return "Unknown Region"
  }

  const currentRegion = getCurrentRegion(form.watch("subdivision"))

  return (
    <div className="container max-w-6xl py-10">
      <div className="mb-8 flex items-center gap-2">
        <CloudRain className="h-6 w-6 text-sky-500" />
        <h1 className="text-3xl font-bold">Rainfall Prediction</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enter Weather Data</CardTitle>
              <CardDescription>Provide details to predict rainfall for your region</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="advanced">Regional Details</TabsTrigger>
                </TabsList>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                    <TabsContent value="basic" className="space-y-6">
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

                      <FormField
                        control={form.control}
                        name="rainToday"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Umbrella className="h-4 w-4" /> Is it raining today?
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-6">
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
                              <SelectContent className="max-h-[300px]">
                                {Object.entries(SUBDIVISION_GROUPS).map(([group, subdivisions]) => (
                                  <div key={group}>
                                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                      {group}
                                    </div>
                                    {subdivisions.map((subdivision) => (
                                      <SelectItem key={subdivision} value={subdivision}>
                                        {subdivision}
                                      </SelectItem>
                                    ))}
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="rounded-lg bg-sky-50 p-4 dark:bg-sky-950">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-sky-600" />
                          <h3 className="font-medium">Selected Region Information</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Region:</strong> {currentRegion}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Subdivision:</strong> {form.watch("subdivision")}
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <h4 className="font-medium mb-2">Regional Rainfall Patterns</h4>
                        <p className="text-sm text-muted-foreground">
                          {form.watch("subdivision") === "KERALA" &&
                            "Kerala receives heavy rainfall during the Southwest Monsoon (June-September) with an average annual rainfall of 3000mm."}
                          {form.watch("subdivision") === "TAMIL NADU" &&
                            "Tamil Nadu receives most of its rainfall during the Northeast Monsoon (October-December) unlike most other parts of India."}
                          {form.watch("subdivision") === "JAMMU & KASHMIR" &&
                            "Jammu & Kashmir has varied rainfall patterns with heavy snowfall in winter and moderate rainfall during spring and summer."}
                          {form.watch("subdivision") !== "KERALA" &&
                            form.watch("subdivision") !== "TAMIL NADU" &&
                            form.watch("subdivision") !== "JAMMU & KASHMIR" &&
                            `${form.watch("subdivision")} has unique rainfall patterns influenced by its geographical location and seasonal variations.`}
                        </p>
                      </div>
                    </TabsContent>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Calculating..." : "Predict Rainfall"}
                    </Button>
                  </form>
                </Form>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-sky-500" />
                <span>Rainfall Patterns in India</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-gradient-to-r from-sky-50 to-blue-50 p-4 dark:from-sky-950 dark:to-blue-950">
                  <h4 className="font-medium mb-2">Seasonal Rainfall Distribution</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {SEASONS.map((season) => (
                      <div
                        key={season.value}
                        className={`rounded-lg p-3 text-center ${
                          form.watch("season") === season.value
                            ? "bg-sky-100 dark:bg-sky-800"
                            : "bg-white dark:bg-slate-800"
                        }`}
                      >
                        <div className="text-xs font-medium">{season.label.split(" ")[0]}</div>
                        <div className="mt-1 text-2xl font-bold text-sky-600 dark:text-sky-400">
                          {season.value === "MONSOON"
                            ? "40%"
                            : season.value === "WINTER"
                              ? "3%"
                              : season.value === "SUMMER"
                                ? "20%"
                                : season.value === "AUTUMN"
                                  ? "22%"
                                  : "15%"}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">of annual</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    <strong>Did you know?</strong> India receives about 80% of its annual rainfall during the monsoon
                    season (June to September).
                  </p>
                  <p>
                    The selected region ({form.watch("subdivision")}) typically experiences{" "}
                    {form.watch("subdivision") === "KERALA" ||
                    form.watch("subdivision") === "COASTAL KARNATAKA" ||
                    form.watch("subdivision") === "KONKAN & GOA"
                      ? "very heavy"
                      : form.watch("subdivision") === "RAJASTHAN" || form.watch("subdivision") === "WEST RAJASTHAN"
                        ? "very light"
                        : "moderate"}{" "}
                    rainfall compared to other regions of India.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
              <CardTitle>Prediction Results</CardTitle>
              <CardDescription className="text-sky-100">Rainfall prediction based on your inputs</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
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
                          className={`${
                            prediction.probability > 70
                              ? "stroke-blue-500"
                              : prediction.probability > 40
                                ? "stroke-sky-500"
                                : "stroke-sky-400"
                          }`}
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

                  <div
                    className={`rounded-lg p-6 ${
                      prediction.willRain ? "bg-blue-50 dark:bg-blue-950" : "bg-amber-50 dark:bg-amber-950"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {prediction.willRain ? (
                        <CloudLightning className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <CloudRain className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                      )}
                      <div>
                        <h3 className="text-xl font-bold">
                          {prediction.willRain ? "Rain Expected Tomorrow" : "No Rain Expected Tomorrow"}
                        </h3>
                        <p
                          className={`text-sm ${
                            prediction.willRain
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {prediction.confidence} confidence prediction
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm ${
                        prediction.willRain ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {prediction.willRain
                        ? `Our model predicts rainfall tomorrow in ${form.watch("subdivision")} with ${prediction.probability}% probability. Consider carrying an umbrella.`
                        : `Our model predicts dry weather tomorrow in ${form.watch("subdivision")} with ${100 - prediction.probability}% probability of no rain.`}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-2">Factors Influencing This Prediction</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                        <p>
                          <strong>Season:</strong> {SEASONS.find((s) => s.value === form.watch("season"))?.label}{" "}
                          typically brings{" "}
                          {form.watch("season") === "MONSOON"
                            ? "heavy"
                            : form.watch("season") === "WINTER"
                              ? "minimal"
                              : "moderate"}{" "}
                          rainfall to this region.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                        <p>
                          <strong>Current Conditions:</strong> It {form.watch("rainToday") === "yes" ? "is" : "is not"}{" "}
                          raining today, which {form.watch("rainToday") === "yes" ? "increases" : "decreases"} the
                          likelihood of rain tomorrow.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                        <p>
                          <strong>Regional Patterns:</strong> {form.watch("subdivision")} has unique rainfall
                          characteristics based on its geographical location.
                        </p>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                        <p>
                          <strong>Month:</strong> {MONTHS.find((m) => m.value === form.watch("month"))?.label} typically
                          sees{" "}
                          {form.watch("month") === "JUL" || form.watch("month") === "AUG"
                            ? "peak monsoon"
                            : form.watch("month") === "JAN" || form.watch("month") === "FEB"
                              ? "minimal"
                              : "variable"}{" "}
                          rainfall in this region.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex h-[400px] flex-col items-center justify-center text-center text-muted-foreground">
                  <div className="relative mb-4">
                    <CloudRain className="h-16 w-16 text-slate-200 dark:text-slate-700" />
                    <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <span className="text-lg">?</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-medium mb-2">No Prediction Yet</h3>
                  <p className="max-w-md text-sm">
                    Enter your location and weather details on the left, then click "Predict Rainfall" to see if it will
                    rain tomorrow.
                  </p>
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
                This prediction model is trained on historical rainfall data across different regions of India,
                analyzing patterns from the following data points:
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-sky-500" />
                    <span>Temporal Factors</span>
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Monthly rainfall patterns (JAN-DEC)</li>
                    <li>• Seasonal aggregates (Jan-Feb, Mar-May, etc.)</li>
                    <li>• Annual rainfall trends</li>
                    <li>• Seasonal indicators (SPRING, SUMMER, etc.)</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-sky-500" />
                    <span>Spatial Factors</span>
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 36 subdivisions across India</li>
                    <li>• Regional rainfall patterns</li>
                    <li>• Geographical variations</li>
                    <li>• Local climate characteristics</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
                <h4 className="font-medium mb-2">How It Works</h4>
                <p className="text-sm text-muted-foreground">
                  The model analyzes historical patterns to predict whether it will rain tomorrow based on today's
                  conditions. It considers the current month, season, region, and whether it's raining today to make its
                  prediction.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Model accuracy varies by region and season. The predictions are most accurate during well-defined
                weather patterns like monsoon season and may have lower confidence during transitional periods.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
