"use client";

import { useState, useEffect } from "react";
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
  CardFooter,
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
import { 
  Loader2, 
  PlusCircle, 
  Ruler, 
  Calendar as CalendarIcon, 
  MapPin, 
  Edit, 
  Trash2, 
  Eye,
  Search
} from "lucide-react";
import { assets as initialAssets, Asset } from "@/lib/data";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  name: z.string().min(1, "Asset title is required."),
  type: z.enum(["Warehouse", "Parking", "Godown", "Land", "Room"]),
  rent: z.coerce.number().positive("Rent must be a positive number."),
  location: z.string().min(1, "Location is required."),
  size: z.coerce.number().positive("Size must be a positive number."),
  description: z.string().optional(),
  status: z.boolean().default(true),
  leaseType: z.enum(["Short-term", "Long-term"]),
  geoLocation: z.string().optional(),
  amenities: z.string().optional(),
  availability: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
  imageUrl: z.string().optional(),
});

export default function AssetManagementPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  
  // Fetch assets from Supabase
  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/assets');
        const result = await response.json();
        
        if (result.error) {
          console.error('Error fetching assets:', result.error);
          toast({
            title: "Error fetching assets",
            description: result.error.message || "Failed to load assets",
            variant: "destructive",
          });
          return;
        }
        
        if (result.data) {
          setAssets(result.data);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
        toast({
          title: "Error fetching assets",
          description: "Failed to load assets from database",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [toast]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");

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
      imageUrl: "https://placehold.co/600x400.png",
    },
  });

  useEffect(() => {
    if (editingAsset) {
      form.reset({
        name: editingAsset.name,
        type: editingAsset.type,
        rent: editingAsset.rent || 0,
        location: editingAsset.location,
        size: editingAsset.size,
        description: "",
        status: editingAsset.status === "Available",
        leaseType: editingAsset.leaseType || "Long-term",
        geoLocation: editingAsset.geoLocation || "",
        amenities: editingAsset.amenities?.join(", ") || "",
        imageUrl: editingAsset.imageUrl,
      });

      if (editingAsset.availability) {
        setDate({
          from: new Date(editingAsset.availability.from),
          to: new Date(editingAsset.availability.to),
        });
      }
    }
  }, [editingAsset, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const assetData = {
        name: values.name,
        type: values.type,
        location: values.location,
        size: values.size,
        imageUrl: values.imageUrl || "https://placehold.co/600x400.png",
        status: values.status ? "Available" : "Leased",
        dataAiHint: values.type.toLowerCase(),
        leaseType: values.leaseType,
        availability: date && date.from && date.to ? { from: date.from.toISOString(), to: date.to.toISOString() } : undefined,
        geoLocation: values.geoLocation,
        rent: values.rent,
        amenities: values.amenities?.split(',').map(a => a.trim()).filter(a => a),
      };

      if (editingAsset) {
        // Update existing asset
        const response = await fetch(`/api/assets/${editingAsset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...assetData, id: editingAsset.id }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update asset');
        }
        
        const result = await response.json();
        
        // Update local state with the returned data
        setAssets(assets.map(asset => 
          asset.id === editingAsset.id 
            ? { ...asset, ...result.data }
            : asset
        ));
        
        toast({
          title: "Asset Updated!",
          description: `The asset "${values.name}" has been successfully updated.`,
        });
      } else {
        // Add new asset
        const response = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assetData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create asset');
        }
        
        const result = await response.json();
        
        // Add new asset to local state with the returned data
        setAssets([...assets, result.data]);
        
        toast({
          title: "Asset Added!",
          description: `The asset "${values.name}" has been successfully added.`,
        });
      }

      // Reset form and state
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
        imageUrl: "https://placehold.co/600x400.png",
      });
      setDate(undefined);
      setEditingAsset(null);
      setActiveTab("list");
    } catch (error) {
      console.error('Error saving asset:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem saving the asset.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(asset: Asset) {
    setEditingAsset(asset);
    setActiveTab("add");
  }

  function handleDelete(assetId: string) {
    const deleteAsset = async () => {
      try {
        const response = await fetch(`/api/assets/${assetId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete asset');
        }
        
        // Update local state
        setAssets(assets.filter(asset => asset.id !== assetId));
        
        toast({
          title: "Asset Deleted",
          description: "The asset has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting asset:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "There was a problem deleting the asset.",
          variant: "destructive",
        });
      }
    };
    
    deleteAsset();
  }

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <PlusCircle className="h-8 w-8 text-primary" />
            Asset Management
          </h1>
          <p className="text-muted-foreground">
            Add, edit, and manage assets available for leasing on the platform.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Asset List</TabsTrigger>
            <TabsTrigger value="add">{editingAsset ? "Edit Asset" : "Add New Asset"}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Manage Assets</CardTitle>
                <CardDescription>
                  View, edit, and delete assets from the platform.
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets by name, location, or type..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Size (sq ft)</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No assets found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.name}</TableCell>
                          <TableCell>{asset.type}</TableCell>
                          <TableCell>{asset.location}</TableCell>
                          <TableCell>{asset.size.toLocaleString()}</TableCell>
                          <TableCell>₹{asset.rent?.toLocaleString() || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={asset.status === "Available" ? "secondary" : "outline"}>
                              {asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="icon" onClick={() => handleEdit(asset)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirm Deletion</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete "{asset.name}"? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => {}}>Cancel</Button>
                                    <Button variant="destructive" onClick={() => handleDelete(asset.id)}>Delete</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredAssets.length} of {assets.length} assets
                </div>
                <Button onClick={() => {
                  setEditingAsset(null);
                  form.reset();
                  setActiveTab("add");
                }}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Asset
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>{editingAsset ? "Edit Asset" : "Add New Asset"}</CardTitle>
                <CardDescription>
                  {editingAsset 
                    ? "Update the details of an existing asset." 
                    : "Fill in the details to add a new asset to the leasing platform."}
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
                              value={field.value}
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

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="e.g., Mumbai, Maharashtra"
                                  className="pl-8"
                                  {...field}
                                />
                              </div>
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
                            <FormLabel>Size (sq ft)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Ruler className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  placeholder="e.g., 5000"
                                  className="pl-8"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Rent (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g., 50000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="leaseType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lease Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
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
                        name="status"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Available for Lease
                              </FormLabel>
                              <FormDescription>
                                Set whether this asset is available for leasing.
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

                      <div className="flex flex-col space-y-2">
                        <FormLabel>Availability Period</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
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
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={date?.from}
                              selected={date}
                              onSelect={setDate}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <FormField
                        control={form.control}
                        name="geoLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Geo Location (Latitude, Longitude)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., 19.0760, 72.8777"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Comma-separated latitude and longitude coordinates.
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
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., https://example.com/image.jpg"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Leave blank to use a placeholder image.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amenities"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Amenities</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="e.g., Power Backup, 24/7 Security, Loading Dock (comma-separated)"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter amenities separated by commas.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter a detailed description of the asset..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingAsset(null);
                          form.reset();
                          setActiveTab("list");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingAsset ? "Update Asset" : "Add Asset"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}