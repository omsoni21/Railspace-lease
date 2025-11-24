
"use client";

import { useState } from "react";
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
import { Loader2, PlusCircle, Ruler, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { assets as initialAssets } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

const formSchema = z.object({
  name: z.string().min(1, "Asset title is required."),
  type: z.enum(["Warehouse", "Parking", "Godown", "Land", "Room"]),
  rent: z.coerce.number().positive("Rent must be a positive number."),
  location: z.string().min(1, "Location is required."),
  size: z.coerce.number().positive("Size must be a positive number."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  imageUrl: z.any().optional(),
  status: z.boolean().default(true),
  leaseType: z.enum(["Short-term", "Long-term"]),
  availability: z.object({
      from: z.date(),
      to: z.date(),
  }).optional(),
  geoLocation: z.string().min(1, "Geo location is required."),
  amenities: z.string().optional(),
});

export default function AddAssetPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "Warehouse",
      rent: 0,
      location: "",
      size: 0,
      description: "",
      status: true,
      leaseType: "Long-term",
      geoLocation: "",
      amenities: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const storedAssets = JSON.parse(
        localStorage.getItem("assets") || JSON.stringify(initialAssets)
      );
      
      const newAsset = {
        id: `ASSET${String(storedAssets.length + 1).padStart(3, "0")}`,
        name: values.name,
        type: values.type,
        location: values.location,
        size: values.size,
        imageUrl: "https://placehold.co/600x400.png",
        status: values.status ? "Available" : "Leased",
        dataAiHint: values.type.toLowerCase(),
        leaseType: values.leaseType,
        availability: values.availability ? { from: values.availability.from.toISOString(), to: values.availability.to.toISOString() } : undefined,
        geoLocation: values.geoLocation,
        rent: values.rent,
        amenities: values.amenities?.split(',').map(a => a.trim()).filter(a => a),
      };

      const updatedAssets = [...storedAssets, newAsset];
      localStorage.setItem("assets", JSON.stringify(updatedAssets));

      toast({
        title: "Asset Added!",
        description: `The asset "${values.name}" has been successfully added.`,
      });

      form.reset({
        name: "",
        type: "Warehouse",
        rent: 0,
        location: "",
        size: 0,
        description: "",
        status: true,
        leaseType: "Long-term",
        geoLocation: "",
        amenities: "",
      });
      setDate(undefined);
    } catch (error) {
      console.error("Failed to add asset:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error adding the new asset.",
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
            <PlusCircle className="h-8 w-8 text-primary" />
            Add New Asset
          </h1>
          <p className="text-muted-foreground">
            Fill in the details to add a new asset to the leasing platform.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Asset Details Form</CardTitle>
            <CardDescription>
              This new asset will be available for users to browse and apply for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Warehouse A – Bhopal"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
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
                            <SelectItem value="Warehouse">Warehouse</SelectItem>
                            <SelectItem value="Parking">Parking</SelectItem>
                            <SelectItem value="Godown">Godown</SelectItem>
                            <SelectItem value="Land">Land</SelectItem>
                            <SelectItem value="Room">Room</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="rent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rent (₹ per month)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50000" {...field} />
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
                          <Input type="number" placeholder="1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Bhopal, MP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="geoLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Geo Location (Coordinates)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 23.2599, 77.4126" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <FormField
                        control={form.control}
                        name="leaseType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lease Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select lease type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Short-term">Short-term</SelectItem>
                                <SelectItem value="Long-term">Long-term</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                     <FormField
                        control={form.control}
                        name="availability"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Availability Dates</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                          id="date"
                                          variant={"outline"}
                                          className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {date?.from ? (
                                            date.to ? (
                                              <>
                                                {format(date.from, "LLL dd, y")} -{" "}
                                                {format(date.to, "LLL dd, y")}
                                              </>
                                            ) : (
                                              format(date.from, "LLL dd, y")
                                            )
                                          ) : (
                                            <span>Pick a date range</span>
                                          )}
                                        </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      initialFocus
                                      mode="range"
                                      defaultMonth={date?.from}
                                      selected={date}
                                      onSelect={(range) => {
                                          setDate(range);
                                          if (range) field.onChange(range);
                                      }}
                                      numberOfMonths={2}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                     />
                 </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the asset..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="amenities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amenities</FormLabel>
                        <FormControl>
                           <Input placeholder="e.g., Power Backup, Water Supply, Security" {...field} />
                        </FormControl>
                         <FormDescription>
                            Provide a comma-separated list of amenities.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Upload Images/Documents</FormLabel>
                        <FormControl>
                        <Input type="file" {...field} />
                        </FormControl>
                        <FormDescription>
                        Upload one or more images or relevant documents.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Mark as Available</FormLabel>
                          <FormDescription>
                            If toggled on, users will be able to see and apply for this asset.
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Asset
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
