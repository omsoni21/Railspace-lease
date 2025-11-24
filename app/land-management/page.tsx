
"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Map, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { detectEncroachment, type DetectEncroachmentOutput } from "@/ai/flows/detect-encroachment";
import { leases } from "@/lib/data";

const formSchema = z.object({
  image: z.any(),
});

export default function LandManagementPage() {
  const [result, setResult] = useState<DetectEncroachmentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!preview) return;
    setIsLoading(true);
    setResult(null);
    try {
      const response = await detectEncroachment({ imageDataUri: preview });
      setResult(response);
    } catch (error) {
      console.error(error);
       setResult({
        hasEncroachment: false,
        details: "An error occurred while analyzing the image.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Expired":
        return "bg-red-100 text-red-800 border-red-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "secondary";
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Map className="h-8 w-8 text-primary" />
            Railway Land Management
          </h1>
          <p className="text-muted-foreground">
            Centralized platform to manage all railway land data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>GIS Map of Land Parcels</CardTitle>
              <CardDescription>
                Interactive map showing location, size, and usage of railway land.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-[400px] w-full bg-muted rounded-lg overflow-hidden">
                <Image
                  src="https://placehold.co/1200x600/228B22/FFFFFF.png"
                  alt="GIS Map of land parcels"
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="satellite map color"
                />
                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <p className="text-white text-2xl font-bold">[Interactive GIS Map]</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Encroachment Detection</CardTitle>
              <CardDescription>
                Upload drone/satellite imagery to detect unauthorized construction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagery File</FormLabel>
                        <FormControl>
                          <Input type="file" accept="image/*" onChange={handleFileChange} />
                        </FormControl>
                        <FormDescription>
                          Upload a top-down image of a land parcel.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {preview && (
                    <div className="mt-4">
                        <Image src={preview} alt="Image preview" width={500} height={300} className="rounded-md object-cover"/>
                    </div>
                  )}
                  <Button type="submit" disabled={isLoading || !preview}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Analyze Image
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
              <CardDescription>
                AI-powered analysis of the uploaded image.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                {!isLoading && !result && <div className="text-muted-foreground text-center">Upload an image to start analysis.</div>}
                {!isLoading && result && (
                    <Alert variant={result.hasEncroachment ? "destructive" : "default"} className={!result.hasEncroachment ? "bg-green-50 border-green-200" : ""}>
                       {result.hasEncroachment ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                       <AlertTitle className="font-bold">
                           {result.hasEncroachment ? "Encroachment Detected" : "No Encroachment Detected"}
                       </AlertTitle>
                       <AlertDescription>
                           {result.details}
                       </AlertDescription>
                   </Alert>
                )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lease Status & Revenue</CardTitle>
            <CardDescription>
              Tracking of all active and past leases.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Asset Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lease Holder</TableHead>
                  <TableHead className="text-right">Monthly Revenue (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases.map((lease) => (
                  <TableRow key={lease.id}>
                    <TableCell className="font-medium">{lease.assetId}</TableCell>
                    <TableCell>{lease.assetName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusVariant(lease.status)}>{lease.status}</Badge>
                    </TableCell>
                    <TableCell>{lease.leaseHolder}</TableCell>
                    <TableCell className="text-right">
                      {lease.monthlyRevenue.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
