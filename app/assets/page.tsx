
"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { Asset } from "@/lib/data";
import { Filters } from "@/components/assets/filters";
import { AssetCard } from "@/components/assets/asset-card";
import AssetMap from "@/components/assets/asset-map";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AssetsPage() {
  const { toast } = useToast();
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [userApplications, setUserApplications] = useState<string[]>([]); // Store asset IDs that user has applied for
  const [userEmail, setUserEmail] = useState<string>(""); // Will be set from localStorage
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("user");
  const [deletingAsset, setDeletingAsset] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    // Fetch real assets from backend API
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add cache-busting parameter to prevent stale data
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/assets?_=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API response error:', res.status, errorText);
          throw new Error(`Failed to load assets: ${res.status}`);
        }
        
        const json = await res.json();
        
        if (!json.data && !Array.isArray(json.data)) {
          console.warn('API returned unexpected data format:', json);
          // Use empty array as fallback
          setAllAssets([]);
          setFilteredAssets([]);
          return;
        }
        
        const assetsToLoad: Asset[] = json.data || [];
        setAllAssets(assetsToLoad);
        setFilteredAssets(assetsToLoad);
      } catch (e: any) {
        console.error('Error fetching assets:', e);
        setError(e.message || "Failed to load assets");
        // Do not use any dummy fallback; show empty state
        setAllAssets([]);
        setFilteredAssets([]);
      } finally {
        setLoading(false);
      }
    };

    // Get current user email and check if admin
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const userObj = JSON.parse(currentUser);
      setUserEmail(userObj.email || "");
      setIsAdmin(userObj.role === "admin" || userObj.email === "admin@example.com");
    }

    fetchAssets();

    // Load user applications
    const storedApplications = localStorage.getItem("applications");
    if (storedApplications && userEmail) {
      const applications = JSON.parse(storedApplications);
      const appliedAssetIds = applications
        .filter((app: { applicantEmail: string }) => app.applicantEmail === userEmail)
        .map((app: { assetId: string }) => app.assetId);
      setUserApplications(appliedAssetIds);
    }
  }, [userEmail]);

  const handleDeleteAsset = async (assetId: string) => {
    try {
      setDeletingAsset(assetId);
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete asset');
      }
      
      // Update local state
      setAllAssets(allAssets.filter(asset => asset.id !== assetId));
      setFilteredAssets(filteredAssets.filter(asset => asset.id !== assetId));
      
      toast({
        title: "Asset Deleted",
        description: "The asset has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Error",
        description: error.message || "There was a problem deleting the asset.",
        variant: "destructive",
      });
    } finally {
      setDeletingAsset(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Available Railway Land for Lease
            </h1>
            <p className="text-muted-foreground">
              Browse, filter, and apply for available railway assets and land parcels.
            </p>
          </div>
          {isAdmin && (
            <Link href="/asset-management">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Manage Assets
              </Button>
            </Link>
          )}
        </div>
        
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading assets…</span>
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-600 p-4 border border-red-200 rounded-md bg-red-50">
            <p className="font-semibold">Error loading assets</p>
            <p>{error}</p>
          </div>
        )}

        {isAdmin ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User View</TabsTrigger>
              <TabsTrigger value="admin">Admin View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user">
              <AssetMap assets={allAssets} />
              <Filters assets={allAssets} setFilteredAssets={setFilteredAssets} />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAssets.map((asset) => (
                  <AssetCard 
                    key={asset.id} 
                    asset={asset} 
                    alreadyApplied={userApplications.includes(asset.id)}
                  />
                ))}
              </div>
              {filteredAssets.length === 0 && !loading && (
                <div className="text-center text-muted-foreground py-12">
                  No assets match your criteria.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="admin">
              <div className="rounded-md border">
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
                    {allAssets.length === 0 && !loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No assets found in the database
                        </TableCell>
                      </TableRow>
                    ) : (
                      allAssets.map((asset) => (
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
                              <Link href={`/asset-management?edit=${asset.id}`}>
                                <Button variant="outline" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Dialog open={deleteDialogOpen && deletingAsset === asset.id} onOpenChange={setDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    onClick={() => setDeletingAsset(asset.id)}
                                  >
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
                                    <Button 
                                      variant="outline" 
                                      onClick={() => {
                                        setDeleteDialogOpen(false);
                                        setDeletingAsset(null);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => handleDeleteAsset(asset.id)}
                                      disabled={deletingAsset === asset.id}
                                    >
                                      {deletingAsset === asset.id ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        "Delete"
                                      )}
                                    </Button>
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
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <AssetMap assets={allAssets} />
            <Filters assets={allAssets} setFilteredAssets={setFilteredAssets} />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAssets.map((asset) => (
                <AssetCard 
                  key={asset.id} 
                  asset={asset} 
                  alreadyApplied={userApplications.includes(asset.id)}
                />
              ))}
            </div>
            {filteredAssets.length === 0 && !loading && (
              <div className="text-center text-muted-foreground py-12">
                No assets match your criteria.
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
