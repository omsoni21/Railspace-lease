
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
import { applications as initialApplications, Application } from "@/lib/data";
import { Files, Check, X, Bot, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { assessApplicationRisk, AssessApplicationRiskOutput } from "@/ai/flows/assess-application-risk";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function ViewApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [aiAssessments, setAiAssessments] = useState<Record<string, AssessApplicationRiskOutput | null>>({});

  useEffect(() => {
    const storedApplications = localStorage.getItem("applications");
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications));
    } else {
      setApplications(initialApplications);
      localStorage.setItem("applications", JSON.stringify(initialApplications));
    }
  }, []);

  const handleStatusChange = (appId: string, newStatus: "Approved" | "Rejected") => {
    const updatedApplications = applications.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
    );
    setApplications(updatedApplications);
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
    
    toast({
        title: `Application ${newStatus}`,
        description: `Application ID ${appId} has been marked as ${newStatus}.`,
    });
  };

  const handleAssessRisk = async (app: Application) => {
    setIsLoading(app.id);
    setAiAssessments(prev => ({...prev, [app.id]: null}));

    try {
        const result = await assessApplicationRisk({
            applicantData: `Name: ${app.applicantName}, Email: ${app.applicantEmail}. Credit Score: ${app.creditScore}. Business History: ${app.businessHistory}.`,
            assetType: app.assetType,
            leaseValue: app.leaseValue,
        });
        setAiAssessments(prev => ({...prev, [app.id]: result}));
    } catch(e) {
        console.error("AI assessment failed", e);
        toast({
            variant: "destructive",
            title: "Assessment Failed",
            description: "The AI risk assessment could not be completed.",
        });
    } finally {
        setIsLoading(null);
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "secondary";
    }
  };

  const getRiskBadgeColor = (score: number) => {
    if (score < 30) return "bg-green-100 text-green-800";
    if (score <= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  }

  const getDecisionBadgeColor = (decision: string) => {
     switch (decision) {
      case "Auto-Approve":
        return "bg-green-100 text-green-800 border-green-200";
      case "Manual-Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Reject":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "secondary";
    }
  }


  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Files className="h-8 w-8 text-primary" />
            Lease Applications
          </h1>
          <p className="text-muted-foreground">
            Review and manage all submitted lease applications with AI-powered risk assessment.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Submitted Applications</CardTitle>
            <CardDescription>
              A list of all lease applications submitted by users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Assessment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="font-medium">{app.applicantName}</div>
                      <div className="text-xs text-muted-foreground">{app.applicantEmail}</div>
                    </TableCell>
                    <TableCell>
                       <div className="font-medium">{app.assetName}</div>
                       <div className="text-xs text-muted-foreground">ID: {app.assetId}</div>
                    </TableCell>
                    <TableCell>{app.submittedDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusVariant(app.status)}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        {isLoading === app.id && <Loader2 className="h-5 w-5 animate-spin" />}
                        {aiAssessments[app.id] ? (
                            <Alert className={`p-2 ${getRiskBadgeColor(aiAssessments[app.id]!.riskScore)}`}>
                                <AlertTitle className="text-xs mb-1 flex justify-between items-center">
                                    <span>Risk Score: {aiAssessments[app.id]!.riskScore}</span>
                                    <Badge variant="outline" className={`text-[10px] p-1 ${getDecisionBadgeColor(aiAssessments[app.id]!.decision)}`}>
                                        {aiAssessments[app.id]!.decision}
                                    </Badge>
                                </AlertTitle>
                                <AlertDescription className="text-[11px] leading-tight">
                                    {aiAssessments[app.id]!.reasoning}
                                </AlertDescription>
                            </Alert>
                        ) : (
                             isLoading !== app.id && (
                                <Button size="sm" variant="ghost" onClick={() => handleAssessRisk(app)}>
                                    <Bot className="h-4 w-4 mr-2"/>
                                    Assess
                                </Button>
                             )
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                        {app.status === 'Pending' && (
                            <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleStatusChange(app.id, 'Approved')}>
                                    <Check className="h-4 w-4 mr-2"/>
                                    Approve
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => handleStatusChange(app.id, 'Rejected')}>
                                    <X className="h-4 w-4 mr-2"/>
                                    Reject
                                </Button>
                            </div>
                        )}
                    </TableCell>
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
