
"use client";

import Link from 'next/link';
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { FileText, Megaphone, User, Warehouse, ClipboardList, CreditCard, IdCard, Settings } from "lucide-react";
import { UserDashboardCarousel } from '@/components/user-dashboard/user-dashboard-carousel';
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from 'react';

export default function UserDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                    <User />
                    Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Valued User'}!
                </CardTitle>
                <p className="text-muted-foreground">
                  This is your personal portal for leasing railway assets. Browse, apply, and report all in one place.
                </p>
              </div>
              <Link href="/profile">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardHeader>
          
        </Card>

        <UserDashboardCarousel />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="text-purple-600"/> My Profile</CardTitle>
              <CardDescription>
                Manage your personal information and verification status.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/profile">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">Go to Profile</Button>
                </Link>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Warehouse className="text-green-600"/> Browse Assets</CardTitle>
              <CardDescription>
                Find available railway land and properties for lease.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/assets">
                    <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700">View Available Assets</Button>
                </Link>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="text-blue-600"/> My Applications</CardTitle>
              <CardDescription>
                Track the status of your submitted lease applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/my-applications">
                    <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-100 hover:text-blue-700">View My Applications</Button>
                </Link>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Megaphone className="text-orange-600"/> Report an Issue</CardTitle>
              <CardDescription>
                Help us by reporting unauthorized land usage.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/report-encroachment">
                    <Button variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-100 hover:text-orange-700">Submit a Report</Button>
                </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
