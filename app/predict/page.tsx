"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CloudRain, Calendar, MapPin, BarChart, Umbrella, CloudLightning, Droplets, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

// Define the form schema
const formSchema = z.object({
  year: z.number().min(1900).max(2100),
  month: z.string().min(1),
  subdivision: z.string().min(1),
  season: z.string().min(1),
  rainToday: z.string(),
  // Add monthly rainfall fields
  monthlyRainfall: z
    .object({
      JAN: z.number().optional(),
      FEB: z.number().optional(),
      MAR: z.number().optional(),
      APR: z.number().optional(),
      MAY: z.number().optional(),
      JUN: z.number().optional(),
      JUL: z.number().optional(),
      AUG: z.number().optional(),
      SEP: z.number().optional(),
      OCT: z.number().optional(),
      NOV: z.number().optional(),
      DEC: z.number().optional(),
    })
    .optional(),
})

// Define types for rainfall statistics and regional data
interface RainfallStats {
  avg_annual_rainfall: number
  max_annual_rainfall: number
  min_annual_rainfall: number
  monsoon_contribution: number
  rain_probability: number
  wettest_month: string
  driest_month: string
}

interface RegionalData {
  avg_annual_rainfall: number
  monsoon_rainfall_pct: number
  rain_probability: number
  monthly_averages: Record<string, number>
  seasonal_pattern: string
}

interface BackendStatus {
  status: "success" | "error"
  message: string
  backendStatus?: any
  backendUrl?: string
  error?: string
  tip?: string
}

export default function PredictPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState<null | {
    willRain: boolean
    probability: number
    confidence: string
    annualRainfall?: number
  }>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [calculatedAnnual, setCalculatedAnnual] = useState<number | null>(null)
  const [rainfallStats, setRainfallStats] = useState<RainfallStats | null>(null)
  const [regionalData, setRegionalData] = useState<RegionalData | null>(null)
  const [isLoadingRegionalData, setIsLoadingRegionalData] = useState(false)
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null)
  const [isCheckingBackend, setIsCheckingBackend] = useState(false)

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: currentYear,
      month: new Date().toLocaleString("en-US", { month: "short" }).toUpperCase(),
      subdivision: "KERALA",
      season: "MONSOON",
      rainToday: "yes",
      monthlyRainfall: {
        JAN: 0,
        FEB: 0,
        MAR: 0,
        APR: 0,
        MAY: 0,
        JUN: 0,
        JUL: 0,
        AUG: 0,
        SEP: 0,
        OCT: 0,
        NOV: 0,
        DEC: 0,
      },
    },
  })

  // Watch for subdivision changes to update regional data
  const currentSubdivision = form.watch("subdivision")

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus()
  }, [])

  // Function to check backend status
  const checkBackendStatus = async () => {
    setIsCheckingBackend(true)
    try {
      const response = await fetch("/api/predict-rainfall/check-backend")
      const data = await response.json()
      setBackendStatus(data)

      if (data.status === "error") {
        toast({
          title: "Backend Connection Issue",
          description: data.message,
          variant: "destructive",
        })
      } else {
        // If backend is running, fetch rainfall stats
        fetchRainfallStats()
      }
    } catch (error) {
      console.error("Error checking backend status:", error)
      setBackendStatus({
        status: "error",
        message: "Failed to check backend status",
        error: error instanceof Error ? error.message : "Unknown error",
        tip: "There might be an issue with your Next.js API routes.",
      })

      toast({
        title: "Connection Error",
        description: "Failed to check backend status. Check the console for details.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingBackend(false)
    }
  }

  // Fetch rainfall statistics
  const fetchRainfallStats = async () => {
    try {
      const response = await fetch("/api/predict-rainfall/rainfall-stats")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch rainfall statistics")
      }
      const data = await response.json()
      setRainfallStats(data)
    } catch (error) {
      console.error("Error fetching rainfall statistics:", error)
      toast({
        title: "Error",
        description: "Failed to fetch rainfall statistics. Using default values.",
        variant: "destructive",
      })
    }
  }

  // Fetch regional data when subdivision changes
  useEffect(() => {
    async function fetchRegionalData() {
      if (!currentSubdivision || backendStatus?.status === "error") return

      setIsLoadingRegionalData(true)
      try {
        const response = await fetch("/api/predict-rainfall/regional-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subdivision: currentSubdivision }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch regional data")
        }

        const data = await response.json()
        setRegionalData(data)

        // Update monthly rainfall values with actual data
        if (data.monthly_averages) {
          const monthlyValues: Record<string, number> = {}

          Object.entries(data.monthly_averages).forEach(([month, value]) => {
            monthlyValues[month] = Number(value)
          })

          form.setValue("monthlyRainfall", monthlyValues)
          calculateAnnualRainfall(monthlyValues)
        }
      } catch (error) {
        console.error("Error fetching regional data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch regional data. Using default values.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingRegionalData(false)
      }
    }

    if (currentSubdivision) {
      fetchRegionalData()
    }
  }, [currentSubdivision, form, toast, backendStatus])

  // Calculate annual rainfall from monthly values
  const calculateAnnualRainfall = (monthlyValues?: Record<string, number>) => {
    const values = monthlyValues || form.getValues("monthlyRainfall")
    if (!values) return 0

    let annual = 0
    Object.values(values).forEach((value) => {
      if (value && !isNaN(value)) {
        annual += value
      }
    })

    setCalculatedAnnual(annual)
    return annual
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (backendStatus?.status === "error") {
      toast({
        title: "Backend Connection Issue",
        description: "Cannot make predictions while the backend is unavailable.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Calculate annual rainfall
      const annualRainfall = calculateAnnualRainfall()

      // Create a complete payload with all required fields
      const payload: Record<string, any> = {
        YEAR: values.year,
        RainToday: values.rainToday === "yes" ? 1 : 0,
        ANNUAL: annualRainfall,
      }

      // Add monthly rainfall values if provided
      if (values.monthlyRainfall) {
        Object.entries(values.monthlyRainfall).forEach(([month, value]) => {
          if (value !== undefined && !isNaN(value)) {
            payload[month] = value
          } else {
            payload[month] = 0
          }
        })
      } else {
        // Initialize all months to 0
        MONTHS.forEach((month) => {
          payload[month.value] = 0
        })
      }

      // Calculate seasonal aggregates with hyphens as expected by the model
      payload["Jan-Feb"] = (payload.JAN || 0) + (payload.FEB || 0)
      payload["Mar-May"] = (payload.MAR || 0) + (payload.APR || 0) + (payload.MAY || 0)
      payload["Jun-Sep"] = (payload.JUN || 0) + (payload.JUL || 0) + (payload.AUG || 0) + (payload.SEP || 0)
      payload["Oct-Dec"] = (payload.OCT || 0) + (payload.NOV || 0) + (payload.DEC || 0)

      // Set all seasons to 0 first
      payload.SPRING = 0
      payload.SUMMER = 0
      payload.MONSOON = 0
      payload.AUTUMN = 0
      payload.WINTER = 0

      // Set the selected season to 1
      payload[values.season] = 1

      // Set all subdivisions to 0 first
      SUBDIVISIONS.forEach((sub) => {
        payload[`SUBDIVISION_${sub}`] = 0
      })

      // Set the selected subdivision to 1
      payload[`SUBDIVISION_${values.subdivision}`] = 1

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
        const errorData = await response.json()
        throw new Error(errorData.error || "API request failed")
      }

      const data = await response.json()
      console.log("API response:", data)

      // Set the prediction based on the API response
      const probability = Math.round(data.prediction * 100)

      setPrediction({
        willRain: data.prediction > 0.5,
        probability: probability,
        confidence: data.confidence || "Medium",
        annualRainfall: data.regional_info?.avg_annual_rainfall || annualRainfall,
      })

      toast({
        title: "Prediction complete",
        description: "Your rainfall prediction has been calculated.",
      })
    } catch (error) {
      console.error("Error making prediction:", error)
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Failed to get prediction. Please try again later.",
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

  // Helper function to get rainfall likelihood based on region and season
  const getRainfallLikelihood = (subdivision: string, season: string) => {
    if (!regionalData) return "unknown"

    const probability = regionalData.rain_probability

    if (probability > 0.7) return "very high"
    if (probability > 0.5) return "high"
    if (probability > 0.3) return "moderate"
    if (probability > 0.1) return "low"
    return "very low"
  }

  const rainfallLikelihood = getRainfallLikelihood(form.watch("subdivision"), form.watch("season"))

  return (
    <div className="container max-w-6xl py-10">
      <div className="mb-8 flex items-center gap-2">
        <CloudRain className="h-6 w-6 text-sky-500" />
        <h1 className="text-3xl font-bold">Rainfall Prediction</h1>
      </div>

      {backendStatus?.status === "error" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backend Connection Issue</AlertTitle>
          <AlertDescription>
            <p>{backendStatus.message}</p>
            {backendStatus.tip && <p className="mt-2">{backendStatus.tip}</p>}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={checkBackendStatus}
              disabled={isCheckingBackend}
            >
              {isCheckingBackend ? "Checking..." : "Retry Connection"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enter Weather Data</CardTitle>
              <CardDescription>Provide details to predict rainfall for your region</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="advanced">Regional Details</TabsTrigger>
                  <TabsTrigger value="rainfall">Rainfall Data</TabsTrigger>
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

                        {isLoadingRegionalData ? (
                          <p className="text-sm text-muted-foreground mt-2">Loading regional data...</p>
                        ) : regionalData ? (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                              <strong>Average Annual Rainfall:</strong> {regionalData.avg_annual_rainfall.toFixed(1)} mm
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>Monsoon Contribution:</strong> {regionalData.monsoon_rainfall_pct.toFixed(1)}%
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <div className="rounded-lg border p-4">
                        <h4 className="font-medium mb-2">Regional Rainfall Patterns</h4>
                        <p className="text-sm text-muted-foreground">
                          {regionalData?.seasonal_pattern ||
                            `${form.watch("subdivision")} has unique rainfall patterns influenced by its geographical location and seasonal variations.`}
                        </p>
                      </div>

                      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CloudRain className="h-4 w-4 text-blue-600" />
                          <span>Rainfall Likelihood</span>
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Based on historical data, the likelihood of rainfall in {form.watch("subdivision")} during{" "}
                          {form.watch("season").toLowerCase()} season is <strong>{rainfallLikelihood}</strong>.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="rainfall" className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Monthly Rainfall Data</h3>
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-sky-500" />
                          <span className="text-sm font-medium">
                            Annual Total: <span className="text-sky-600">{calculatedAnnual?.toFixed(1) || 0} mm</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {MONTHS.map((month) => (
                          <FormItem key={month.value} className="space-y-1">
                            <FormLabel className="text-xs">{month.label} (mm)</FormLabel>
                            <Input
                              type="number"
                              step="0.1"
                              value={form.watch(`monthlyRainfall.${month.value}`) || 0}
                              onChange={(e) => {
                                form.setValue(
                                  `monthlyRainfall.${month.value}`,
                                  e.target.value ? Number.parseFloat(e.target.value) : 0,
                                )
                                calculateAnnualRainfall()
                              }}
                              className="h-8"
                            />
                          </FormItem>
                        ))}
                      </div>

                      <div className="rounded-lg bg-sky-50 p-4 dark:bg-sky-950">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <BarChart className="h-4 w-4 text-sky-600" />
                          <span>Rainfall Distribution</span>
                        </h4>
                        <p className="text-sm text-sky-700 dark:text-sky-300 mb-2">
                          The values above represent the monthly rainfall in millimeters for {form.watch("subdivision")}
                          .
                        </p>
                        <div className="h-20 flex items-end gap-1">
                          {MONTHS.map((month) => {
                            const value = form.watch(`monthlyRainfall.${month.value}`) || 0
                            const maxValue = Math.max(
                              ...(Object.values(form.watch("monthlyRainfall") || {}).filter(
                                (v) => v !== undefined && !isNaN(v),
                              ) as number[]),
                            )
                            const height = maxValue > 0 ? (value / maxValue) * 100 : 0
                            return (
                              <div key={month.value} className="flex-1 flex flex-col items-center">
                                <div className="w-full bg-sky-500 rounded-t" style={{ height: `${height}%` }}></div>
                                <div className="text-[10px] mt-1">{month.value}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </TabsContent>

                    <Button type="submit" className="w-full" disabled={isLoading || backendStatus?.status === "error"}>
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
                          {rainfallStats && season.value === "MONSOON"
                            ? `${Math.round(rainfallStats.monsoon_contribution)}%`
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
                  {rainfallStats && (
                    <p>
                      The wettest month across India is typically <strong>{rainfallStats.wettest_month}</strong> and the
                      driest is <strong>{rainfallStats.driest_month}</strong>. The average annual rainfall across India
                      is <strong>{rainfallStats.avg_annual_rainfall.toFixed(1)} mm</strong>.
                    </p>
                  )}
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

                  {prediction.annualRainfall && (
                    <div className="rounded-lg bg-sky-50 p-4 dark:bg-sky-950">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="h-5 w-5 text-sky-600" />
                        <h3 className="font-medium">Annual Rainfall</h3>
                      </div>
                      <div className="text-3xl font-bold text-sky-600">{prediction.annualRainfall.toFixed(1)} mm</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Average annual rainfall for {form.watch("subdivision")}
                      </p>
                    </div>
                  )}

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
                      <li className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                        <p>
                          <strong>Annual Rainfall:</strong> The total annual rainfall of{" "}
                          {prediction.annualRainfall?.toFixed(1) || calculatedAnnual?.toFixed(1) || "0"} mm is{" "}
                          {prediction.annualRainfall && prediction.annualRainfall > 2000
                            ? "very high"
                            : prediction.annualRainfall && prediction.annualRainfall > 1000
                              ? "high"
                              : prediction.annualRainfall && prediction.annualRainfall > 500
                                ? "moderate"
                                : "low"}{" "}
                          for this region.
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
