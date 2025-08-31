"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameDay, parseISO, addDays } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth/store";
import { getAppointments, getAppointmentTypes, createAppointmentType } from "@/lib/api/appointments";
import { Appointment, AppointmentType } from "@/types/appointment";
import AppointmentForm from "@/components/appointments/appointment-form";
import AppointmentDetails from "@/components/appointments/appointment-details";

// Default appointment types to create if none exist
const DEFAULT_APPOINTMENT_TYPES = [
  {
    name: "Regular Checkup",
    description: "Routine dental examination and cleaning",
    duration_minutes: 30,
    color: "#3498db",  // Blue
  },
  {
    name: "Teeth Cleaning",
    description: "Professional teeth cleaning",
    duration_minutes: 45,
    color: "#2ecc71",  // Green
  },
  {
    name: "Filling",
    description: "Dental filling procedure",
    duration_minutes: 60,
    color: "#e74c3c",  // Red
  },
  {
    name: "Root Canal",
    description: "Root canal treatment",
    duration_minutes: 90,
    color: "#9b59b6",  // Purple
  },
  {
    name: "Block-Out Time",
    description: "Reserved time slot (not available for appointments)",
    duration_minutes: 60,
    color: "#7f8c8d",  // Gray
  }
];

export default function SchedulePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "day">("month");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  const { token } = useAuthStore();

  // No longer need a separate function for creating default appointment types
  // as it's now handled directly in the useEffect

  // Fetch appointments for the current month
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const startDate = view === "month"
          ? startOfMonth(date)
          : date;
        const endDate = view === "month"
          ? endOfMonth(date)
          : addDays(date, 1);

        console.log("Fetching appointments for date range:", {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          view
        });

        // getAppointments now handles errors internally and returns an empty array if there's an error
        const data = await getAppointments(token, startDate, endDate);
        console.log("Appointments fetched:", data);
        setAppointments(data);

        if (data.length === 0) {
          console.log("No appointments found or API unavailable");
        }
      } catch (error) {
        console.error("Failed to process appointments:", error);
        toast.error("Failed to process appointments. Please try again.");
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [token, date, view]);

  // Fetch appointment types
  useEffect(() => {
    const fetchAppointmentTypes = async () => {
      if (!token) return;

      try {
        console.log("Fetching appointment types...");

        // getAppointmentTypes now handles errors internally and returns an empty array if there's an error
        const data = await getAppointmentTypes(token);
        console.log("Appointment types fetched:", data);

        // If no appointment types exist, create default ones
        if (!data || data.length === 0) {
          console.log("No appointment types found, creating defaults...");

          // Create default appointment types
          const createdTypes = await Promise.all(
            DEFAULT_APPOINTMENT_TYPES.map(type => createAppointmentType(token, type))
          );

          console.log("Default appointment types created:", createdTypes);
          setAppointmentTypes(createdTypes);
        } else {
          setAppointmentTypes(data);
        }
      } catch (error) {
        console.error("Failed to process appointment types:", error);
        toast.error("Failed to process appointment types. Using default types.");

        // Fallback to default types
        setAppointmentTypes(DEFAULT_APPOINTMENT_TYPES.map((type, index) => ({
          ...type,
          id: index + 1,
          is_active: true
        })));
      }
    };

    fetchAppointmentTypes();
  }, [token]);

  const handlePrevious = () => {
    if (view === "month") {
      setDate(subMonths(date, 1));
    } else {
      setDate(addDays(date, -1));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setDate(addMonths(date, 1));
    } else {
      setDate(addDays(date, 1));
    }
  };

  const handleViewChange = (newView: "month" | "day") => {
    setView(newView);
  };

  const handleDateSelect = (selectedDate: Date) => {
    setDate(selectedDate);
    setView("day");
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setShowAppointmentForm(true);
  };

  const handleAppointmentFormClose = () => {
    setShowAppointmentForm(false);
  };

  const handleAppointmentDetailsClose = () => {
    setSelectedAppointment(null);
  };

  const handleAppointmentCreated = (appointment: Appointment) => {
    setAppointments([...appointments, appointment]);
    setShowAppointmentForm(false);
    toast.success("Appointment created successfully");
  };

  const handleAppointmentUpdated = (updatedAppointment: Appointment) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === updatedAppointment.id ? updatedAppointment : appointment
      )
    );
    setSelectedAppointment(null);
    toast.success("Appointment updated successfully");
  };

  const handleAppointmentCancelled = (appointmentId: number) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: "cancelled" }
          : appointment
      )
    );
    setSelectedAppointment(null);
    toast.success("Appointment cancelled successfully");
  };

  // Render appointments for the month view
  const renderMonthView = () => {
    const days = eachDayOfInterval({
      start: startOfMonth(date),
      end: endOfMonth(date),
    });

    return (
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-medium py-2">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dayAppointments = appointments.filter((appointment) =>
            isSameDay(parseISO(appointment.start_time), day)
          );

          return (
            <div
              key={day.toString()}
              className={cn(
                "min-h-24 p-1 border rounded-md",
                isSameDay(day, new Date()) && "bg-muted"
              )}
              onClick={() => handleDateSelect(day)}
            >
              <div className="font-medium text-sm mb-1">{format(day, "d")}</div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((appointment) => {
                  const appointmentType = appointmentTypes.find(
                    (type) => type.id === appointment.appointment_type_id
                  );

                  return (
                    <div
                      key={appointment.id}
                      className="text-xs p-1 rounded truncate"
                      style={{
                        backgroundColor: appointmentType?.color || "#3498db",
                        color: "white",
                      }}
                    >
                      {format(parseISO(appointment.start_time), "h:mm a")}
                    </div>
                  );
                })}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render appointments for the day view
  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    return (
      <div className="space-y-2">
        {hours.map((hour) => {
          const startTime = new Date(date);
          startTime.setHours(hour, 0, 0, 0);

          const endTime = new Date(date);
          endTime.setHours(hour + 1, 0, 0, 0);

          const hourAppointments = appointments.filter((appointment) => {
            const appointmentStart = parseISO(appointment.start_time);
            return (
              appointmentStart >= startTime && appointmentStart < endTime
            );
          });

          return (
            <div key={hour} className="flex">
              <div className="w-20 text-right pr-4 py-2 text-sm">
                {format(startTime, "h:mm a")}
              </div>
              <div className="flex-1 min-h-16 border-t relative">
                {hourAppointments.map((appointment) => {
                  const appointmentType = appointmentTypes.find(
                    (type) => type.id === appointment.appointment_type_id
                  );

                  return (
                    <div
                      key={appointment.id}
                      className="absolute rounded p-2 text-sm cursor-pointer"
                      style={{
                        backgroundColor: appointmentType?.color || "#3498db",
                        color: "white",
                        top: "0",
                        left: "0",
                        right: "0",
                        height: "calc(100% - 4px)",
                      }}
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <div className="font-medium">
                        {format(parseISO(appointment.start_time), "h:mm a")} -
                        {format(parseISO(appointment.end_time), "h:mm a")}
                      </div>
                      {appointment.is_block_out ? (
                        <div>Block-out time</div>
                      ) : (
                        <div>Patient Appointment</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewChange("month")}
            className={cn(view === "month" && "bg-primary text-primary-foreground")}
          >
            Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewChange("day")}
            className={cn(view === "day" && "bg-primary text-primary-foreground")}
          >
            Day
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <EnhancedCalendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={handleNewAppointment}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <p>Loading schedule...</p>
            </div>
          ) : view === "month" ? (
            renderMonthView()
          ) : (
            renderDayView()
          )}
        </div>
      </div>

      {showAppointmentForm && (
        <AppointmentForm
          appointmentTypes={appointmentTypes}
          onClose={handleAppointmentFormClose}
          onAppointmentCreated={handleAppointmentCreated}
          selectedDate={date}
        />
      )}

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          appointmentTypes={appointmentTypes}
          onClose={handleAppointmentDetailsClose}
          onAppointmentUpdated={handleAppointmentUpdated}
          onAppointmentCancelled={handleAppointmentCancelled}
        />
      )}
    </div>
  );
}
