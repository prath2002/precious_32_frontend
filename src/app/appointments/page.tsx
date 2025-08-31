import { Button } from "@/components/ui/button";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <Button>New Appointment</Button>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <p className="text-sm text-muted-foreground">No appointments found.</p>
        </div>
      </div>
    </div>
  );
}
