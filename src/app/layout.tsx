import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import ProtectedRoute from "@/components/auth/protected-route";
import { Toaster } from "@/components/ui/sonner";
import HealthMonitor from "@/components/health/health-monitor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Briana Dental Clinic Management",
  description: "A custom clinic management software for Dr. Briana's dental practice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Authentication is handled by the ProtectedRoute component

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <HealthMonitor />
        <ProtectedRoute>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4">
                {children}
              </main>
            </div>
          </div>
        </ProtectedRoute>
        <Toaster />
      </body>
    </html>
  );
}
