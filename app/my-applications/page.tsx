"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applications as initialApplications, Application } from "@/lib/data";
import { FileText, Search, Clock, CheckCircle, XCircle } from "lucide-react";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userEmail, setUserEmail] = useState("john.d@example.com"); // In a real app, this would come from auth

  useEffect(() => {
    // Load applications from localStorage or use initial data
    const storedApplications = localStorage.getItem("applications");
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications));
    } else {
      setApplications(initialApplications);
    }
  }, []);

  // Filter applications by the current user's email
  const userApplications = applications.filter(
    (app) => app.applicantEmail === userEmail
  );

  // Filter applications by search term
  const filteredApplications = userApplications.filter(
    (app) =>
      app.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "Pending":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "Pending":
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            My Applications
          </h1>
          <p className="text-muted-foreground">
            Track the status of your lease applications
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Application Tracking</CardTitle>
                <CardDescription>
                  View and track all your submitted lease applications
                </CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search applications..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Submitted Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{app.assetName}</div>
                        <div className="text-sm text-muted-foreground">
                          {app.assetId}
                        </div>
                      </TableCell>
                      <TableCell>{app.submittedDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusVariant(app.status)}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(app.status)}
                            {app.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <div className="h-0.5 w-5 bg-gray-200"></div>
                          <div className={`h-2 w-2 rounded-full ${app.status === "Pending" || app.status === "Approved" ? "bg-yellow-500" : "bg-red-500"}`}></div>
                          <div className="h-0.5 w-5 bg-gray-200"></div>
                          <div className={`h-2 w-2 rounded-full ${app.status === "Approved" ? "bg-green-500" : "bg-gray-300"}`}></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {app.status === "Pending" && "Under review"}
                          {app.status === "Approved" && "Approved"}
                          {app.status === "Rejected" && "Rejected"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}