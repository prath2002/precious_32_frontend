"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/auth/store";
import { getDashboardAppointments } from "@/lib/api/appointments";
import { Appointment } from "@/types/appointment";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Home() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("week");

  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        // Set days based on selected time range
        let days = 7; // default to week
        if (timeRange === "today") days = 1;
        if (timeRange === "month") days = 30;

        const data = await getDashboardAppointments(token, days);
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        toast.error("Failed to fetch appointments. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [token, timeRange]);

  const handleNewAppointment = () => {
    router.push("/schedule");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={handleNewAppointment}>New Appointment</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Patients" value="0" />
        <DashboardCard
          title="Upcoming Appointments"
          value={appointments.length.toString()}
          subtitle={timeRange === "today" ? "Today" : timeRange === "week" ? "This Week" : "This Month"}
        />
        <DashboardCard title="Pending Payments" value="$0" />
        <DashboardCard title="Documents Uploaded" value="0" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>
            View and manage upcoming appointments
          </CardDescription>
          <Tabs
            defaultValue="week"
            className="mt-2"
            onValueChange={(value) => setTimeRange(value as "today" | "week" | "month")}
          >
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <p>Loading appointments...</p>
            </div>
          ) : appointments.length > 0 ? (
            <AppointmentList
              appointments={appointments}
              showPatient
              showDentist={user?.role === "receptionist"}
            />
          ) : (
            <div className="flex items-center justify-center p-6 text-center">
              <div className="space-y-3">
                <p className="text-lg font-medium">No appointments found</p>
                <p className="text-sm text-muted-foreground">
                  There are no appointments scheduled for this time period.
                </p>
                <Button
                  className="mt-2"
                  onClick={handleNewAppointment}
                >
                  Schedule Appointment
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  subtitle
}: {
  title: string;
  value: string;
  subtitle?: string
}) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 flex flex-col space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
