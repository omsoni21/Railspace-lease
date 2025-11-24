
"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verifyDocument, type VerifyDocumentOutput } from "@/ai/flows/verify-document";

const formSchema = z.object({
  documentType: z.enum(['PAN', 'Aadhaar', 'GST Certificate']),
  image: z.any().refine((files) => files?.length > 0, "Document image is required."),
});

export default function VerifyDocumentPage() {
  const [result, setResult] = useState<VerifyDocumentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        documentType: 'PAN',
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
      const response = await verifyDocument({
        imageDataUri: preview,
        documentType: values.documentType,
      });
      setResult(response);
      toast({
        title: "Verification Complete!",
        description: "The AI has analyzed your document.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "An error occurred while verifying your document.",
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
            <FileCheck className="h-8 w-8 text-primary" />
            Document Verification
          </h1>
          <p className="text-muted-foreground">
            Upload your documents for AI-powered verification (KYC).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle>Submit a Document</CardTitle>
                  <CardDescription>
                    Your document will be verified for authenticity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PAN">PAN Card</SelectItem>
                              <SelectItem value="Aadhaar">Aadhaar Card</SelectItem>
                              <SelectItem value="GST Certificate">GST Certificate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload Document Image</FormLabel>
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
                          Upload a clear image of the document.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {preview && (
                    <div className="mt-4">
                      <Image
                        src={preview}
                        alt="Document preview"
                        width={400}
                        height={250}
                        className="rounded-md object-contain border"
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading || !preview}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Verify Document
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Verification Result</CardTitle>
              <CardDescription>
                AI-powered analysis of your document.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
              {isLoading && (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              )}
              {!isLoading && !result && (
                <div className="text-muted-foreground text-center">
                  Submit a document to see the analysis.
                </div>
              )}
              {!isLoading && result && (
                <Alert
                  variant={result.isVerified ? "default" : "destructive"}
                  className={
                    result.isVerified ? "bg-green-50 border-green-200" : ""
                  }
                >
                  {result.isVerified ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle className="font-bold flex justify-between">
                    <span>{result.isVerified ? "Document Verified" : "Verification Failed"}</span>
                     <span className="font-normal text-sm">Trust Score: {result.trustScore}%</span>
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                     <p><strong>Extracted Data:</strong> {result.extractedData}</p>
                     <p><strong>Remarks:</strong> {result.remarks}</p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
