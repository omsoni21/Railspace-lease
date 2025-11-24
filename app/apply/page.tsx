"use client";

import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  applications as initialApplications,
  assets as initialAssets,
} from "@/lib/data";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";

/* -------------------------------------------------------------------------- */
/*                          Helper: Get user profile                          */
/* -------------------------------------------------------------------------- */
const getUserProfile = () => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return {
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        pan: userData.pan || "",
        aadhar: userData.aadhar || "",
      };
    }
  }
  return {
    name: "",
    email: "",
    phone: "",
    pan: "",
    aadhar: "",
  };
};

/* -------------------------------------------------------------------------- */
/*                               Zod Validation                               */
/* -------------------------------------------------------------------------- */
const formSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits."),
  proposedUse: z.string().min(10, "Please describe the proposed use."),
  leaseDuration: z.string().min(1, "Lease duration is required."),
  leaseType: z.enum(["Short-term", "Long-term", "Seasonal"]),
  leaseStartDate: z.string().min(1, "Start date is required."),
  documents: z.any().optional(),
  interestedInBidding: z.boolean().default(false),
  maxBidAmount: z.coerce.number().optional(),
  autoBidEnabled: z.boolean().default(false),
  bidIncrement: z.coerce.number().optional(),
});

/* -------------------------------------------------------------------------- */
/*                             Main Page Component                            */
/* -------------------------------------------------------------------------- */
export default function ApplyPage() {
  const searchParams = useSearchParams();
  const assetId = searchParams.get("assetId") || "";
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [assets, setAssets] = useState(initialAssets);

  // Load stored assets
  useEffect(() => {
    const storedAssets = localStorage.getItem("assets");
    if (storedAssets) {
      setAssets(JSON.parse(storedAssets));
    }
  }, []);

  // Form initialization
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetId: assetId || "",
      name: "",
      email: "",
      phone: "",
      proposedUse: "",
      leaseDuration: "12",
      leaseType: "Long-term",
      leaseStartDate: new Date().toISOString().split("T")[0],
      documents: [],
      interestedInBidding: false,
      maxBidAmount: 0,
      autoBidEnabled: false,
      bidIncrement: 0,
    },
  });

  // Refresh user profile on mount (client-side only)
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        form.setValue("name", user.user_metadata?.full_name || user.email?.split('@')[0] || "");
        form.setValue("email", user.email || "");
        form.setValue("phone", user.user_metadata?.phone || "");
      }
    };
    loadUser();
  }, [form]);

  /* ----------------------------- Submit Handler ----------------------------- */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const storedApplications = JSON.parse(
        localStorage.getItem("applications") ||
          JSON.stringify(initialApplications)
      );
      const asset = assets.find((a) => a.id === values.assetId);

      const newApplication = {
        id: `APP${String(storedApplications.length + 1).padStart(3, "0")}`,
        assetId: values.assetId,
        assetName: asset ? asset.name : "Unknown Asset",
        applicantName: values.name,
        applicantEmail: values.email,
        applicantPhone: values.phone,
        proposedUse: values.proposedUse,
        leaseDuration: values.leaseDuration,
        leaseType: values.leaseType,
        leaseStartDate: values.leaseStartDate,
        interestedInBidding: values.interestedInBidding,
        maxBidAmount: values.interestedInBidding ? values.maxBidAmount : null,
        autoBidEnabled: values.interestedInBidding
          ? values.autoBidEnabled
          : false,
        bidIncrement:
          values.interestedInBidding && values.autoBidEnabled
            ? values.bidIncrement
            : null,
        status: "Pending",
        submittedDate: new Date().toISOString().split("T")[0],
      };

      const updatedApplications = [...storedApplications, newApplication];
      localStorage.setItem("applications", JSON.stringify(updatedApplications));

      toast({
        title: "Application Submitted!",
        description: `Your lease application for asset ${values.assetId} has been received.`,
      });

      form.reset({
        assetId: assetId,
        name: "",
        email: "",
        phone: "",
        proposedUse: "",
        leaseDuration: "",
        documents: undefined,
      });
    } catch (error) {
      console.error("Failed to submit application:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your application.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  /* ------------------------------- JSX Return ------------------------------- */
  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Lease Application
          </h1>
          <p className="text-muted-foreground">
            Complete the form to apply for an asset lease.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Your application will be reviewed by an administrator.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Asset ID */}
                <FormField
                  control={form.control}
                  name="assetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., WH001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name / Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            {...field}
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Phone + Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 12345 67890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="leaseDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposed Lease Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 5 years" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Lease Type + Start Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="leaseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lease Type</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            {...field}
                          >
                            <option value="Short-term">Short-term</option>
                            <option value="Long-term">Long-term</option>
                            <option value="Seasonal">Seasonal</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="leaseStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lease Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Proposed Use */}
                <FormField
                  control={form.control}
                  name="proposedUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposed Use of Asset</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe how you plan to use the asset..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Documents */}
                <FormField
                  control={form.control}
                  name="documents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Documents</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload any relevant documents (ID proof, business plan,
                        etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bidding Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Bidding Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable bidding if you're interested in participating in the
                    auction for this asset.
                  </p>

                  {/* Interested in bidding */}
                  <FormField
                    control={form.control}
                    name="interestedInBidding"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Interested in Bidding
                          </FormLabel>
                          <FormDescription>
                            Enable to participate in the bidding process for
                            this asset.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Conditional bidding inputs */}
                  {form.watch("interestedInBidding") && (
                    <div className="space-y-4 rounded-md border p-4">
                      <FormField
                        control={form.control}
                        name="maxBidAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Bid Amount (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>
                              The maximum amount you're willing to bid.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="autoBidEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Enable Auto-Bidding
                              </FormLabel>
                              <FormDescription>
                                Automatically place bids up to your maximum
                                amount.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {form.watch("autoBidEnabled") && (
                        <FormField
                          control={form.control}
                          name="bidIncrement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bid Increment (₹)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormDescription>
                                Amount to increase your bid by in each round.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button type="submit" disabled={isLoading} className="mt-6">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
