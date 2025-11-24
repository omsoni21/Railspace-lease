
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  suggestLeaseRate,
  type SuggestLeaseRateOutput,
} from "@/ai/flows/suggest-lease-rate";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  assetType: z.string().min(1, "Asset type is required."),
  location: z.string().min(1, "Location is required."),
  size: z.coerce.number().min(1, "Size must be a positive number."),
  assetCondition: z.string().min(1, "Asset condition is required."),
  historicalData: z
    .string()
    .min(1, "Historical data is required for analysis."),
  marketTrends: z.string().min(1, "Market trends are required for analysis."),
});

export default function AiToolPage() {
  const [result, setResult] = useState<SuggestLeaseRateOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetType: "Warehouse",
      location: "Mumbai, Maharashtra",
      size: 50000,
      assetCondition: "Good",
      historicalData:
        "Similar warehouses in the area leased for ₹15-20 per sq. ft. last year with an 85% occupancy rate.",
      marketTrends: "Industrial lease rates have increased by 5% in the last quarter due to demand. MagicBricks shows comps at ₹22/sq. ft. Inflation is currently at 4.75%.",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await suggestLeaseRate(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      setResult({
        suggestedLeaseRate: 0,
        confidenceLevel: 'Low',
        rationale: 'An error occurred while fetching the suggestion.'
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getConfidenceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Dynamic Pricing Engine
          </h1>
          <p className="text-muted-foreground">
            Get AI-powered suggestions for competitive lease rates based on market data.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="lg:col-span-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle>Asset & Market Details</CardTitle>
                  <CardDescription>
                    Provide data points for the engine to analyze.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="assetType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select asset type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Warehouse">
                                Warehouse
                              </SelectItem>
                              <SelectItem value="Parking">Parking</SelectItem>
                              <SelectItem value="Godown">Godown</SelectItem>
                              <SelectItem value="Land">Land</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="assetCondition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Condition</FormLabel>
                           <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Excellent">Excellent</SelectItem>
                              <SelectItem value="Good">Good</SelectItem>
                              <SelectItem value="Fair">Fair</SelectItem>
                               <SelectItem value="Poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Mumbai, Maharashtra"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size (sq. ft.)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="historicalData"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Historical & Occupancy Data</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Lease data and occupancy rates..."
                            {...field}
                          />
                        </FormControl>
                         <FormDescription>
                          Provide past lease rates and historical occupancy percentages.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marketTrends"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Market Trends & Economic Indicators</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Current market trends, competitor rates, inflation..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe current trends, competitor prices, and relevant economic data.
                        </FormDescription>
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
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate Price
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          <div className="lg:col-span-1">
             <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle>AI Recommendation</CardTitle>
                    <CardDescription>
                        The AI-powered pricing suggestion will appear below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[300px] flex items-center justify-center">
                    {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                    {!isLoading && result && (
                    <div className="space-y-4 text-center w-full">
                        <div>
                        <p className="text-sm text-muted-foreground">Suggested Lease Rate (per sq. ft. / month)</p>
                        <p className="text-5xl font-bold text-primary">
                            ₹{result.suggestedLeaseRate.toFixed(2)}
                        </p>
                        </div>
                        <div>
                        <p className="text-sm text-muted-foreground">Confidence Level</p>
                        <Badge variant="outline" className={`text-lg ${getConfidenceColor(result.confidenceLevel)}`}>{result.confidenceLevel}</Badge>
                        </div>
                        <div>
                        <p className="text-sm text-muted-foreground">Rationale</p>
                        <p className="text-sm text-foreground/80 leading-relaxed">{result.rationale}</p>
                        </div>
                    </div>
                    )}
                     {!isLoading && !result && (
                         <div className="text-center text-muted-foreground">
                            <p>Fill out the form to get a suggestion.</p>
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
