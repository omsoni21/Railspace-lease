
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Asset } from "@/lib/data";
import { Calendar as CalendarIcon, Search, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type FiltersProps = {
  assets: Asset[];
  setFilteredAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
};

export function Filters({ assets, setFilteredAssets }: FiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [assetType, setAssetType] = useState("all");
  const [status, setStatus] = useState<"all" | "Available" | "Leased">(
    "Available"
  );
  const [date, setDate] = useState<DateRange | undefined>();
  
  const maxRent = Math.max(...assets.map(a => a.rent || 0), 0);
  const [rentRange, setRentRange] = useState([0, maxRent]);

  useEffect(() => {
    // When assets load, update the max value of the slider
    const newMaxRent = Math.max(...assets.map(a => a.rent || 0), 0);
    if(newMaxRent > 0) {
      setRentRange([0, newMaxRent]);
    }
  }, [assets]);

  useEffect(() => {
    let filtered = assets;

    if (status !== "all") {
      filtered = filtered.filter((asset) => asset.status === status);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (assetType !== "all") {
      filtered = filtered.filter((asset) => asset.type === assetType);
    }
    
    // Filter by rent range
    if(maxRent > 0) {
        filtered = filtered.filter(asset => {
            const rent = asset.rent || 0;
            return rent >= rentRange[0] && rent <= rentRange[1];
        });
    }

    // Filter by availability date
    if (date?.from && date?.to) {
      filtered = filtered.filter(asset => {
        if (!asset.availability) return true; // If no availability specified, assume it's available
        const assetFrom = new Date(asset.availability.from);
        const assetTo = new Date(asset.availability.to);
        // Check for overlap
        return assetFrom <= date.to! && assetTo >= date.from!;
      });
    }


    setFilteredAssets(filtered);
  }, [searchTerm, assetType, status, date, assets, setFilteredAssets, rentRange, maxRent]);

  const handleRentChange = (value: number[]) => {
      setRentRange(value);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-2">
            <Label htmlFor="search">Search by Keyword</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Asset Type</Label>
            <Select
              value={assetType}
              onValueChange={setAssetType}
            >
              <SelectTrigger id="asset-type">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Warehouse">Warehouse</SelectItem>
                <SelectItem value="Parking">Parking</SelectItem>
                <SelectItem value="Godown">Godown</SelectItem>
                <SelectItem value="Land">Land</SelectItem>
                <SelectItem value="Room">Room</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as "all" | "Available" | "Leased")
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Leased">Leased</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-1">
             <Label>Availability Date</Label>
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
           <div className="space-y-2 md:col-span-2">
            <Label>Rent per Month (₹)</Label>
            <div className="flex items-center gap-4">
                 <span className="text-sm text-muted-foreground">₹{rentRange[0].toLocaleString()}</span>
                 <Slider
                    min={0}
                    max={maxRent}
                    step={1000}
                    value={rentRange}
                    onValueChange={handleRentChange}
                    disabled={maxRent === 0}
                />
                 <span className="text-sm text-muted-foreground">₹{rentRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
