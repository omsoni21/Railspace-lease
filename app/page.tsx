
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Train } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeUserTab, setActiveUserTab] = useState("signin");

  // Admin states
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // User Sign-in states
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  // User Register states
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPan, setRegisterPan] = useState("");
  const [registerAadhar, setRegisterAadhar] = useState("");

  useEffect(() => {
    // This will run on the client side
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.push("/user-dashboard");
      }
    };
    checkUser();
  }, [router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (
      adminEmail === "Admin@123gmail.com" &&
      adminPassword === "Admin123"
    ) {
      toast({
        title: "Admin Login Successful",
        description: "Welcome back! Redirecting to admin dashboard...",
      });
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Credentials",
        description: "Please check your admin email and password.",
      });
       setIsLoading(false);
    }
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to your dashboard...",
      });
      router.push("/user-dashboard");
    }
  };
  
  const validatePan = (pan: string) => {
      const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
      return panRegex.test(pan.toUpperCase());
  }

  const validateAadhar = (aadhar: string) => {
      const aadharRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
      return aadharRegex.test(aadhar);
  }

  const handleUserRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      if(registerPassword.length < 6) {
          toast({ variant: "destructive", title: "Registration Failed", description: "Password must be at least 6 characters long." });
          return;
      }
      if (!validatePan(registerPan)) {
          toast({ variant: "destructive", title: "Registration Failed", description: "Invalid PAN card format." });
          return;
      }
      if (!validateAadhar(registerAadhar)) {
          toast({ variant: "destructive", title: "Registration Failed", description: "Invalid Aadhar number format." });
          return;
      }

      setIsLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            full_name: registerName,
            pan: registerPan,
            aadhar: registerAadhar,
          },
        },
      });

      if (error) {
          toast({ variant: "destructive", title: "Registration Failed", description: error.message });
          setIsLoading(false);
      } else {
          toast({
              title: "Registration Successful!",
              description: "Welcome to RailSpace! Redirecting to your dashboard...",
          });
          
          // Auto-login after registration
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: registerEmail,
            password: registerPassword,
          });
          
          if (!loginError) {
            router.push("/user-dashboard");
          }
          
          setRegisterName('');
          setRegisterEmail('');
          setRegisterPassword('');
          setRegisterPan('');
          setRegisterAadhar('');
          setIsLoading(false);
      }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 z-0 opacity-20">
        <Image
          src="https://placehold.co/1920x1080/000000/FFFFFF.png"
          alt="Background image of a modern train station"
          layout="fill"
          objectFit="cover"
          className="opacity-10"
          data-ai-hint="train station"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      </div>
      <div className="relative z-10 w-full max-w-md p-4">
        <Card className="shadow-2xl border-primary/20 bg-card/80 backdrop-blur-sm">
          <div className="p-6 bg-primary text-primary-foreground rounded-t-lg flex flex-col items-center text-center">
            <Train className="w-16 h-16 mb-4" />
            <h1 className="text-4xl font-bold font-headline">
              RailSpace Lease
            </h1>
            <p className="mt-2 text-primary-foreground/80">
             A digital solution to lease unused Indian Railway land/assets.
            </p>
          </div>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="user">
                <Tabs value={activeUserTab} onValueChange={setActiveUserTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    <TabsContent value="signin">
                        <form onSubmit={handleUserLogin}>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                <Label htmlFor="user-email">Email</Label>
                                <Input id="user-email" type="email" placeholder="you@example.com" value={userEmail} onChange={e => setUserEmail(e.target.value)} disabled={isLoading} required/>
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="user-password">Password</Label>
                                <Input id="user-password" type="password" placeholder="••••••••" value={userPassword} onChange={e => setUserPassword(e.target.value)} disabled={isLoading} required/>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col space-y-2">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign In
                                </Button>
                                <Button onClick={handleGoogleLogin} className="w-full" variant="outline" disabled={isLoading}>
                                    Sign In with Google
                                </Button>
                            </CardFooter>
                        </form>
                    </TabsContent>
                    <TabsContent value="register">
                         <form onSubmit={handleUserRegister}>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="reg-name">Full Name</Label>
                                    <Input id="reg-name" placeholder="John Doe" value={registerName} onChange={e => setRegisterName(e.target.value)} disabled={isLoading} required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-email">Email</Label>
                                    <Input id="reg-email" type="email" placeholder="you@example.com" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} disabled={isLoading} required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-password">Password</Label>
                                    <Input id="reg-password" type="password" placeholder="••••••••" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} disabled={isLoading} required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-pan">PAN Card Number</Label>
                                    <Input id="reg-pan" placeholder="ABCDE1234F" value={registerPan} onChange={e => setRegisterPan(e.target.value.toUpperCase())} disabled={isLoading} required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-aadhar">Aadhar Card Number</Label>
                                    <Input id="reg-aadhar" type="text" placeholder="123456789012" value={registerAadhar} onChange={e => setRegisterAadhar(e.target.value)} disabled={isLoading} required/>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </CardFooter>
                        </form>
                    </TabsContent>
                </Tabs>
            </TabsContent>
            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin}>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@railspace.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Admin Sign In
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

    
