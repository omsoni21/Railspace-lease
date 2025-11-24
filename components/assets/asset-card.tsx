
import Image from "next/image";
import Link from "next/link";
import { Asset } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Ruler, Sparkles, IndianRupee, CheckCircle, AlertCircle } from "lucide-react";

interface AssetCardProps {
  asset: Asset;
  alreadyApplied?: boolean;
}

export function AssetCard({ asset, alreadyApplied = false }: AssetCardProps) {
  // Determine button state and text
  const isButtonDisabled = asset.status !== 'Available' || alreadyApplied;
  const buttonText = alreadyApplied ? "Already Applied" : "Lease Now";
  
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={asset.imageUrl}
            alt={`Image of ${asset.name}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint={asset.dataAiHint}
          />
           <Badge className="absolute top-2 right-2" variant="secondary">{asset.leaseType}</Badge>
           {alreadyApplied && (
             <Badge className="absolute top-2 left-2 bg-blue-100 text-blue-800 border-blue-200">
               <AlertCircle className="h-3 w-3 mr-1" />
               Applied
             </Badge>
           )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start">
           <p className="font-semibold text-sm">{asset.type}</p>
           <Badge variant={asset.status === 'Available' ? 'secondary' : 'destructive'} className={asset.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{asset.status}</Badge>
        </div>
        <CardTitle className="mt-2 text-lg font-bold">{asset.name}</CardTitle>
        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{asset.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            <span>{asset.size.toLocaleString()} sq. ft.</span>
          </div>
          {asset.rent && (
            <div className="flex items-center gap-2 font-semibold text-foreground">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span>{asset.rent.toLocaleString('en-IN')} / month</span>
            </div>
          )}
        </div>
        {asset.amenities && asset.amenities.length > 0 && (
            <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-xs mb-2 text-muted-foreground">AMENITIES</h4>
                <div className="flex flex-wrap gap-2">
                    {asset.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs font-normal">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500"/>
                            {amenity}
                        </Badge>
                    ))}
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Link href={alreadyApplied ? "/my-applications" : `/apply?assetId=${asset.id}`} className="w-full">
          <Button 
            className="w-full" 
            disabled={isButtonDisabled}
            variant={alreadyApplied ? "outline" : "default"}
          >
            {buttonText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
