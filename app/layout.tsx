import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import ChatBot from "../components/ui/ChatBot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "RailSpace Lease",
  description:
    "A digital solution to lease unused Indian Railway land/assets for temporary use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable}`}> 
      <head />
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <ChatBot />
      </body>
    </html>
  );
}
