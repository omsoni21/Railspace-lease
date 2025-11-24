
"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  processEncroachmentReport,
  type ProcessEncroachmentReportOutput,
} from "@/ai/flows/report-encroachment";
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
import { Input } from "@/components/ui/input";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Megaphone,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Award,
  Gift,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  image: z.any().refine(files => files?.length > 0, "Image is required."),
  location: z.string().min(1, "Location is required."),
  description: z.string().min(10, "Please provide a detailed description."),
  isAnonymous: z.boolean().default(false),
});

export default function ReportEncroachmentPage() {
  const [result, setResult] = useState<ProcessEncroachmentReportOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      description: "",
      isAnonymous: false,
    },
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
      const response = await processEncroachmentReport({
        imageDataUri: preview,
        location: values.location,
        description: values.description,
        isAnonymous: values.isAnonymous,
      });
      setResult(response);
      toast({
        title: "Report Submitted Successfully!",
        description: "Your report is being processed by our AI.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "An error occurred while submitting your report.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" />
            Report Encroachment
          </h1>
          <p className="text-muted-foreground">
            Help us protect railway land by reporting unauthorized activities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle>Submit a Report</CardTitle>
                  <CardDescription>
                    Fill out the details below. Your report will be reviewed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload Photo</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              field.onChange(e.target.files);
                              handleFileChange(e);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          A clear photo of the potential encroachment.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {preview && (
                    <div className="mt-4">
                      <Image
                        src={preview}
                        alt="Image preview"
                        width={300}
                        height={200}
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Near Main Station, City"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide GPS coordinates or a clear address.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description of Issue</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the unauthorized activity..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isAnonymous"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Submit Anonymously</FormLabel>
                          <FormDescription>
                            Your personal information will not be shared if you
                            check this box.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading || !preview}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Submit Report
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200">
              <CardHeader className="flex flex-row items-center gap-4">
                <Award className="h-10 w-10 text-yellow-600" />
                <div>
                  <CardTitle className="text-yellow-800">
                    Earn Rewards!
                  </CardTitle>
                  <CardDescription className="text-yellow-700">
                    Get rewarded for verified reports.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-yellow-900">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  <p>Your reports help us protect national assets.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <p>
                    Gamify your contribution and get recognized!
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Assessment</CardTitle>
                <CardDescription>
                  Initial analysis of your report.
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[200px] flex items-center justify-center">
                {isLoading && (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                )}
                {!isLoading && !result && (
                  <div className="text-muted-foreground text-center">
                    Submit a report to see the AI analysis.
                  </div>
                )}
                {!isLoading && result && (
                  <Alert
                    variant={
                      result.isValidReport ? "default" : "destructive"
                    }
                    className={
                      result.isValidReport
                        ? "bg-green-50 border-green-200"
                        : ""
                    }
                  >
                    {result.isValidReport ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertTitle className="font-bold">
                      {result.isValidReport
                        ? "Report Seems Valid"
                        : "Potential Issue with Report"}
                    </AlertTitle>
                    <AlertDescription>
                      {result.assessment}
                    </AlertDescription>
                    {result.isValidReport && result.rewardTier !== "None" && (
                       <div className="mt-4 flex items-center gap-2">
                         <Award className="h-5 w-5 text-yellow-600" />
                         <p className="text-sm font-semibold">Potential Reward Tier: {result.rewardTier}</p>
                       </div>
                    )}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
