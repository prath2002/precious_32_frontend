import { format } from "date-fns";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Calendar, Clock } from "lucide-react";

interface AppointmentListProps {
  appointments: Appointment[];
  showPatient?: boolean;
  showDentist?: boolean;
  onViewDetails?: (appointmentId: number) => void;
  className?: string;
}

export function AppointmentList({
  appointments,
  showPatient = false,
  showDentist = false,
  onViewDetails,
  className = ""
}: AppointmentListProps) {
  const router = useRouter();
  
  // Function to get status badge color
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return "bg-blue-500 hover:bg-blue-600";
      case AppointmentStatus.COMPLETED:
        return "bg-green-500 hover:bg-green-600";
      case AppointmentStatus.CANCELLED:
        return "bg-red-500 hover:bg-red-600";
      case AppointmentStatus.NO_SHOW:
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };
  
  // Handle view details click
  const handleViewDetails = (appointmentId: number) => {
    if (onViewDetails) {
      onViewDetails(appointmentId);
    } else {
      router.push(`/appointments/${appointmentId}`);
    }
  };
  
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No appointments found.
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {appointments.map((appointment) => (
        <div 
          key={appointment.id} 
          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {format(new Date(appointment.start_time), "PPP")}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4" />
                {format(new Date(appointment.start_time), "p")} - {format(new Date(appointment.end_time), "p")}
              </div>
              
              {showPatient && appointment.patient && (
                <div className="text-sm mt-2">
                  <span className="font-medium">Patient:</span> {appointment.patient.first_name} {appointment.patient.last_name}
                </div>
              )}
              
              {showDentist && appointment.dentist && (
                <div className="text-sm mt-1">
                  <span className="font-medium">Dentist:</span> {appointment.dentist.full_name}
                </div>
              )}
              
              <div className="mt-2">
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewDetails(appointment.id)}
            >
              View Details
            </Button>
          </div>
          
          {appointment.notes && (
            <div className="mt-2 text-sm border-t pt-2">
              <span className="font-medium">Notes:</span> {appointment.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
