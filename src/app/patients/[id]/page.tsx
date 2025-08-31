"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { getPatientAppointmentsWithToken } from "@/lib/api/appointments";
import { Appointment } from "@/types/appointment";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth/store";
import { getPatientWithToken } from "@/lib/api/patients";
import { Patient } from "@/types/patient";
import { ArrowLeft, Edit, Calendar, FileText, DollarSign } from "lucide-react";

interface PatientDetailPageProps {
  params: { id: string };
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const patientId = parseInt(unwrappedParams.id);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const router = useRouter();
  // Using sonner toast directly
  const { token, user } = useAuthStore();

  useEffect(() => {
    const fetchPatient = async () => {
      if (!token || isNaN(patientId)) return;

      setIsLoading(true);
      try {
        const data = await getPatientWithToken(token, patientId);
        setPatient(data);
      } catch (error) {
        console.error("Failed to fetch patient:", error);
        toast.error("Failed to fetch patient details. Please try again.");
        router.push("/patients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [token, patientId, router]);

  // Fetch patient appointments
  useEffect(() => {
    const fetchPatientAppointments = async () => {
      if (!token || isNaN(patientId)) return;

      setIsLoadingAppointments(true);
      try {
        const data = await getPatientAppointmentsWithToken(token, patientId);
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch patient appointments:", error);
        toast.error("Failed to fetch appointments. Please try again.");
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchPatientAppointments();
  }, [token, patientId]);

  const handleEditPatient = () => {
    router.push(`/patients/${patientId}/edit`);
  };

  const handleBack = () => {
    router.push("/patients");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading patient details...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p>Patient not found</p>
        <Button onClick={handleBack}>Back to Patients</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {patient.first_name} {patient.last_name}
          </h1>
        </div>
        <Button onClick={handleEditPatient}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Date of Birth</div>
              <div className="text-sm">
                {format(new Date(patient.date_of_birth), "PPP")}
              </div>
              <div className="text-sm font-medium">Gender</div>
              <div className="text-sm capitalize">{patient.gender ? patient.gender.toLowerCase() : "-"}</div>
              <div className="text-sm font-medium">Phone</div>
              <div className="text-sm">{patient.phone}</div>
              <div className="text-sm font-medium">Email</div>
              <div className="text-sm">{patient.email || "-"}</div>
              <div className="text-sm font-medium">Address</div>
              <div className="text-sm">
                {patient.address
                  ? `${patient.address}, ${patient.city || ""} ${
                      patient.state || ""
                    } ${patient.postal_code || ""}`
                  : "-"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Name</div>
              <div className="text-sm">{patient.emergency_contact_name || "-"}</div>
              <div className="text-sm font-medium">Phone</div>
              <div className="text-sm">{patient.emergency_contact_phone || "-"}</div>
              <div className="text-sm font-medium">Relationship</div>
              <div className="text-sm">
                {patient.emergency_contact_relationship || "-"}
              </div>
            </div>
          </CardContent>
        </Card>

        {user?.role === "dentist" && (
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Provider</div>
                <div className="text-sm">{patient.insurance_provider || "-"}</div>
                <div className="text-sm font-medium">Policy Number</div>
                <div className="text-sm">{patient.insurance_policy_number || "-"}</div>
                <div className="text-sm font-medium">Group Number</div>
                <div className="text-sm">{patient.insurance_group_number || "-"}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="medical">
        <TabsList>
          {user?.role === "dentist" && <TabsTrigger value="medical">Medical Information</TabsTrigger>}
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          {user?.role === "dentist" && <TabsTrigger value="billing">Billing</TabsTrigger>}
        </TabsList>

        {user?.role === "dentist" && (
          <TabsContent value="medical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Blood Type</h3>
                    <p className="text-sm">{patient.blood_type || "-"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Last Dental Visit</h3>
                    <p className="text-sm">
                      {patient.last_dental_visit
                        ? format(new Date(patient.last_dental_visit), "PPP")
                        : "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Allergies</h3>
                  <p className="text-sm whitespace-pre-line">
                    {patient.allergies || "No allergies recorded"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Medical Conditions</h3>
                  <p className="text-sm whitespace-pre-line">
                    {patient.medical_conditions || "No medical conditions recorded"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Current Medications</h3>
                  <p className="text-sm whitespace-pre-line">
                    {patient.current_medications || "No medications recorded"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Dental History</h3>
                  <p className="text-sm whitespace-pre-line">
                    {patient.dental_history || "No dental history recorded"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>
                View and manage patient appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="flex items-center justify-center p-6">
                  <p>Loading appointments...</p>
                </div>
              ) : appointments.length > 0 ? (
                <AppointmentList appointments={appointments} showDentist />
              ) : (
                <div className="flex items-center justify-center p-6 text-center">
                  <div className="space-y-3">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium">No appointments yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Schedule an appointment for this patient
                    </p>
                    <Button
                      className="mt-2"
                      onClick={() => router.push(`/schedule?patient_id=${patientId}`)}
                    >
                      Schedule Appointment
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                View and manage patient documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6 text-center">
                <div className="space-y-3">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">No documents yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload documents for this patient
                  </p>
                  <Button className="mt-2" disabled>
                    Upload Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === "dentist" && (
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing</CardTitle>
                <CardDescription>
                  View and manage patient billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6 text-center">
                  <div className="space-y-3">
                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-medium">No billing information yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Add billing information for this patient
                    </p>
                    <Button className="mt-2" disabled>
                      Add Payment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
