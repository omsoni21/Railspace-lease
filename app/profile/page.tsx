
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
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCog, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/, "Invalid phone number."),
  pan: z.string().regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format."),
  aadhar: z.string().regex(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/, "Invalid Aadhar format."),
});

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [isPhoneVerifying, setIsPhoneVerifying] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      pan: "",
      aadhar: "",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          setUser(profile || { id: user.id });
          setEmailVerified(!!user.email_confirmed_at);
          setPhoneVerified(!!user.phone_confirmed_at);
          
          form.reset({
            name: profile?.full_name || user.user_metadata?.full_name || '',
            email: user.email,
            phone: profile?.phone_number || '',
            pan: profile?.pan_number || '',
            aadhar: profile?.aadhar_number || '',
          });

        } else {
          router.push("/"); // Redirect if no user is logged in
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data.",
        });
      } finally {
        setPageLoading(false);
      }
    };
    fetchUser();
  }, [form, router, toast]);

  const handleEmailVerification = async () => {
    setIsEmailVerifying(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
      });
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send verification email.",
        });
      } else {
        toast({
          title: "Verification Email Sent",
          description: "Please check your inbox for the verification link.",
        });
      }
    }
    setIsEmailVerifying(false);
  };

  const handlePhoneVerification = async () => {
    setIsPhoneVerifying(true);
    const phone = form.getValues("phone");
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
    });
    if (error) {
      console.error("OTP Error:", error);
      toast({
        variant: "destructive",
        title: "Error sending OTP",
        description: error.message || "Failed to send OTP. Please check the phone number.",
      });
    } else {
      setIsOtpSent(true);
      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your phone number.",
      });
    }
    setIsPhoneVerifying(false);
  };

  const handleOtpVerification = async () => {
    setIsPhoneVerifying(true);
    const phone = form.getValues("phone");
    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: 'sms',
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "OTP Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
      });
    } else {
      toast({
        title: "Phone Verified",
        description: "Your phone number has been successfully verified.",
      });
      setIsOtpSent(false);
      // Reload to reflect verification status
      window.location.reload();
    }
    setIsPhoneVerifying(false);
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            full_name: values.name,
            phone_number: values.phone,
            pan_number: values.pan,
            aadhar_number: values.aadhar,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        // Also update the user's metadata
        const { error: userError } = await supabase.auth.updateUser({
          data: { full_name: values.name },
        });

        if (userError) throw userError;

        toast({
          title: "Profile Updated!",
          description: "Your information has been successfully saved.",
        });
        
        // Force a re-render of user-nav if name changes
        if (values.name !== user.user_metadata.full_name) {
            window.location.reload();
        }

      } catch (error) {
        console.error("Failed to update profile:", error);
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: "There was an error updating your profile.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }

  if (pageLoading || !user) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <UserCog className="h-8 w-8 text-primary" />
            Edit Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your personal information.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
            <CardDescription>
              Update your profile information below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input placeholder="you@example.com" {...field} readOnly disabled />
                          {emailVerified ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <Button type="button" variant="outline" onClick={handleEmailVerification} disabled={isEmailVerifying}>
                              {isEmailVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input placeholder="1234567890" {...field} />
                          {phoneVerified ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <Button type="button" variant="outline" onClick={handlePhoneVerification} disabled={isPhoneVerifying}>
                              {isPhoneVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isOtpSent && (
                  <FormItem>
                    <FormLabel>Enter OTP</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                        <Button type="button" onClick={handleOtpVerification} disabled={isPhoneVerifying}>
                          {isPhoneVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify OTP"}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                 <FormField
                  control={form.control}
                  name="pan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Card Number</FormLabel>
                      <FormControl>
                        <Input placeholder="ABCDE1234F" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aadhar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhar Card Number</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789012" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
