import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeaseStatusChart } from "@/components/dashboard/lease-status-chart";
import { AssetUtilizationChart } from "@/components/dashboard/asset-utilization-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { IndianRupee, FileCheck2, Warehouse, Building } from "lucide-react";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Welcome Back, Admin!</CardTitle>
            <p className="text-muted-foreground">
              Here's a snapshot of your leasing activities.
            </p>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
                Total Revenue
              </CardTitle>
              <IndianRupee className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">₹4,52,31,890</div>
              <p className="text-xs text-green-700 dark:text-green-300">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Active Leases
              </CardTitle>
              <FileCheck2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">+2,350</div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 dark:bg-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Assets Available
              </CardTitle>
              <Warehouse className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">+573</div>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                +19% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Lease Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaseStatusChart />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Asset Utilization (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <AssetUtilizationChart />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
