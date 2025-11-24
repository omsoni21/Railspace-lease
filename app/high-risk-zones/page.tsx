
"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  predictHighRiskZones,
  type PredictHighRiskZonesOutput,
} from "@/ai/flows/predict-high-risk-zones";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldAlert, Bot, Map, Thermometer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  historicalData: z.string().min(1, "Historical data is required."),
  landRecords: z.string().min(1, "Land records summary is required."),
  satelliteAnalysis: z
    .string()
    .min(1, "Satellite analysis summary is required."),
});

export default function HighRiskZonesPage() {
  const [result, setResult] = useState<PredictHighRiskZonesOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      historicalData: "Frequent small-scale encroachments noted near Mumbai Central Station over the last 2 years, primarily temporary stalls. A large illegal settlement was cleared near the Chennai port area last year.",
      landRecords: "Multiple ownership disputes ongoing for a land parcel adjacent to the Delhi-Jaipur railway line. Records for some rural plots in West Bengal are outdated.",
      satelliteAnalysis: "Recent satellite images show new, small structures appearing along the trackside in the Hyderabad suburban region. Increased vegetation clearing observed near a protected forest boundary in Kerala.",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await predictHighRiskZones(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      setResult({ zones: [] }); // Handle error case
    } finally {
      setIsLoading(false);
    }
  }
  
  const getRiskBadgeVariant = (riskLevel: "High" | "Medium" | "Low") => {
    switch (riskLevel) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "secondary";
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" />
            High-Risk Encroachment Zones
          </h1>
          <p className="text-muted-foreground">
            Use AI to analyze data and predict areas vulnerable to encroachment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle>Data Analysis</CardTitle>
                  <CardDescription>
                    Input data summaries for the AI to analyze.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="historicalData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Historical Encroachment Data</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Summarize past incidents..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="landRecords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Land Records Summary</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Summarize disputed or unclear records..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="satelliteAnalysis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Satellite Image Analysis</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Summarize recent satellite findings..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Bot className="mr-2 h-4 w-4" />
                    )}
                    Predict High-Risk Zones
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          
          <div className="lg:col-span-3 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Heatmap of Vulnerable Zones</CardTitle>
                <CardDescription>
                  Visual representation of high-risk areas across the country.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="relative h-[300px] w-full bg-muted rounded-lg overflow-hidden">
                    <Image
                    src="https://placehold.co/1200x600/1B2538/FFFFFF.png"
                    alt="Heatmap of India"
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="satellite india"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center p-4">
                        <p className="text-white text-lg font-semibold">[Vulnerability Heatmap Overlay]</p>
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI-Predicted High-Risk Zones</CardTitle>
                <CardDescription>
                  List of zones with the highest risk of future encroachment.
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                 {isLoading && <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                 {!isLoading && !result && <div className="text-muted-foreground text-center py-8">Run analysis to see results.</div>}
                 {!isLoading && result && result.zones.length === 0 && <div className="text-muted-foreground text-center py-8">No high-risk zones were identified based on the provided data.</div>}
                 {!isLoading && result && result.zones.length > 0 && (
                    <div className="space-y-4">
                        {result.zones.map((zone, index) => (
                             <Alert key={index} className="flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                     <AlertTitle className="font-bold flex items-center gap-2">
                                        <Map className="h-4 w-4" />
                                        {zone.location}
                                    </AlertTitle>
                                    <Badge variant="outline" className={getRiskBadgeVariant(zone.riskLevel)}>{zone.riskLevel} Risk</Badge>
                                </div>
                               <AlertDescription>
                                   {zone.reason}
                               </AlertDescription>
                           </Alert>
                        ))}
                    </div>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
