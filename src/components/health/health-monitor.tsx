"use client";

import { useEffect } from "react";
import { startBackendHealthMonitoring } from "@/lib/api/health";

export default function HealthMonitor() {
  // Start backend health monitoring on component mount
  useEffect(() => {
    console.log('Starting backend health monitoring');
    startBackendHealthMonitoring();
  }, []);

  // This component doesn't render anything
  return null;
}
