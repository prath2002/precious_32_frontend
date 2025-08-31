"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth/store";
import { updateAppointment, cancelAppointment } from "@/lib/api/appointments";
import { Appointment, AppointmentType, AppointmentStatus } from "@/types/appointment";

interface AppointmentDetailsProps {
  appointment: Appointment;
  appointmentTypes: AppointmentType[];
  onClose: () => void;
  onAppointmentUpdated: (appointment: Appointment) => void;
  onAppointmentCancelled: (appointmentId: number) => void;
}

export default function AppointmentDetails({
  appointment,
  appointmentTypes,
  onClose,
  onAppointmentUpdated,
  onAppointmentCancelled,
}: AppointmentDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState(appointment.status);
  const [notes, setNotes] = useState(appointment.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { token } = useAuthStore();

  const appointmentType = appointmentTypes.find(
    (type) => type.id === appointment.appointment_type_id
  );

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!token) {
      toast.error("You must be logged in to update an appointment");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedAppointment = await updateAppointment(token, appointment.id, {
        status,
        notes,
      });

      onAppointmentUpdated(updatedAppointment);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update appointment:", error);
      toast.error("Failed to update appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!token) {
      toast.error("You must be logged in to cancel an appointment");
      return;
    }

    setIsSubmitting(true);

    try {
      await cancelAppointment(token, appointment.id);
      onAppointmentCancelled(appointment.id);
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error("Failed to cancel appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {appointment.is_block_out ? "Block-out Time" : "Appointment Details"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Date</h3>
                <p className="text-sm">
                  {format(parseISO(appointment.start_time), "PPP")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Time</h3>
                <p className="text-sm">
                  {format(parseISO(appointment.start_time), "h:mm a")} -
                  {format(parseISO(appointment.end_time), "h:mm a")}
                </p>
              </div>
            </div>

            {!appointment.is_block_out && (
              <>
                <div>
                  <h3 className="text-sm font-medium">Appointment Type</h3>
                  <p className="text-sm">
                    {appointmentType?.name || "Unknown"} (
                    {appointmentType?.duration_minutes || "?"} min)
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Patient</h3>
                  <p className="text-sm">
                    Patient ID: {appointment.patient_id}
                  </p>
                </div>
              </>
            )}

            <div>
              <h3 className="text-sm font-medium">Status</h3>
              {isEditing ? (
                <Select
                  value={status}
                  onValueChange={setStatus}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AppointmentStatus.SCHEDULED}>
                      Scheduled
                    </SelectItem>
                    <SelectItem value={AppointmentStatus.CONFIRMED}>
                      Confirmed
                    </SelectItem>
                    <SelectItem value={AppointmentStatus.COMPLETED}>
                      Completed
                    </SelectItem>
                    <SelectItem value={AppointmentStatus.NO_SHOW}>
                      No Show
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm capitalize">{appointment.status}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium">Notes</h3>
              {isEditing ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="resize-none"
                  disabled={isSubmitting}
                />
              ) : (
                <p className="text-sm whitespace-pre-line">
                  {appointment.notes || "No notes"}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={appointment.status === AppointmentStatus.CANCELLED}
                >
                  Cancel Appointment
                </Button>
                <Button type="button" onClick={handleEdit}>
                  Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>No</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground"
            >
              {isSubmitting ? "Cancelling..." : "Yes, Cancel Appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
