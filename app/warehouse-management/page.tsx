
"use client";

import { useState } from 'react';
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { warehouses, goodsMovements, Warehouse } from "@/lib/data";
import { Building2, Wrench, Thermometer, Droplets, ArrowRightLeft, Loader2, Info } from "lucide-react";
import { predictMaintenance, PredictMaintenanceOutput } from '@/ai/flows/predict-maintenance';

export default function WarehouseManagementPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<Record<string, PredictMaintenanceOutput>>({});

    const getHealthStatusVariant = (status: string) => {
        switch (status) {
            case 'Good':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Needs Checkup':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Maintenance Required':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'secondary';
        }
    };

    const getOccupancyColor = (percentage: number) => {
        if (percentage > 90) return 'bg-red-500';
        if (percentage > 75) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    const handleAnalyze = async (warehouse: Warehouse) => {
        setIsLoading(warehouse.id);
        setAnalysisResult(prev => ({ ...prev, [warehouse.id]: null! }));
        try {
            const result = await predictMaintenance({
                warehouseId: warehouse.id,
                sensorData: warehouse.sensorData,
            });
            setAnalysisResult(prev => ({ ...prev, [warehouse.id]: result }));
        } catch (error) {
            console.error("Analysis failed", error);
            setAnalysisResult(prev => ({ ...prev, [warehouse.id]: {
                maintenanceRequired: true,
                urgency: 'High',
                recommendation: 'Error during analysis.'
            } }));
        } finally {
            setIsLoading(null);
        }
    }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Warehouse Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage your warehouse assets in real-time.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Warehouse Status & Predictive Maintenance</CardTitle>
            <CardDescription>
              Overview of warehouse occupancy, health, and AI-powered maintenance predictions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Health Status</TableHead>
                  <TableHead>Sensor Data</TableHead>
                  <TableHead className="text-right">Maintenance Analysis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((wh) => (
                  <TableRow key={wh.id}>
                    <TableCell className="font-medium">{wh.name}<br/><span className="text-xs text-muted-foreground">{wh.location}</span></TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Progress value={wh.occupancy} className="w-24 h-2" indicatorClassName={getOccupancyColor(wh.occupancy)}/>
                            <span className="text-sm font-semibold">{wh.occupancy}%</span>
                        </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getHealthStatusVariant(wh.healthStatus)}>{wh.healthStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{wh.sensorData}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleAnalyze(wh)} disabled={isLoading === wh.id}>
                        {isLoading === wh.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wrench className="h-4 w-4" />}
                        <span className="ml-2">Analyze</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {Object.keys(analysisResult).map(whId => analysisResult[whId] && (
                 <Alert key={whId} className="mt-6" variant={analysisResult[whId].maintenanceRequired ? "destructive" : "default"}>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Analysis for Warehouse {whId}</AlertTitle>
                    <AlertDescription>
                        <p><strong>Recommendation:</strong> {analysisResult[whId].recommendation}</p>
                        {analysisResult[whId].maintenanceRequired && <p><strong>Urgency:</strong> {analysisResult[whId].urgency}</p>}
                    </AlertDescription>
                </Alert>
            ))}

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Goods Movement</CardTitle>
            <CardDescription>
              Log of inbound and outbound goods across all warehouses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Warehouse</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Goods</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Timestamp</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {goodsMovements.map(m => (
                        <TableRow key={m.id}>
                            <TableCell>{m.warehouseId}</TableCell>
                            <TableCell>
                                <Badge variant={m.type === 'Inbound' ? 'secondary' : 'outline'}>{m.type}</Badge>
                            </TableCell>
                            <TableCell>{m.goods}</TableCell>
                            <TableCell>{m.quantity}</TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">{m.timestamp}</TableCell>
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
