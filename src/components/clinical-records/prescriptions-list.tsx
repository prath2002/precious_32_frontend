"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, 
  PlusCircle, 
  Pill, 
  FileText, 
  Printer, 
  X 
} from "lucide-react";
import { getPrescriptions, cancelPrescription } from "@/lib/api/prescriptions";
import { Prescription, PrescriptionStatus } from "@/types/prescriptions";

interface PrescriptionsListProps {
  patientId: number;
  visitNoteId?: number;
  initialPrescriptions?: Prescription[];
}

const statusColors: Record<PrescriptionStatus, string> = {
  active: "bg-green-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-500",
};

export function PrescriptionsList({ 
  patientId, 
  visitNoteId, 
  initialPrescriptions 
}: PrescriptionsListProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions || []);
  const [loading, setLoading] = useState(!initialPrescriptions);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    async function loadPrescriptions() {
      try {
        setLoading(true);
        const data = await getPrescriptions(
          visitNoteId ? undefined : patientId, 
          visitNoteId
        );
        setPrescriptions(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load prescriptions:", err);
        setError("Failed to load prescriptions. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (!initialPrescriptions) {
      loadPrescriptions();
    }
  }, [patientId, visitNoteId, initialPrescriptions]);

  const handleCreatePrescription = () => {
    const url = `/clinical-records/prescriptions/new?patientId=${patientId}${
      visitNoteId ? `&visitNoteId=${visitNoteId}` : ""
    }`;
    router.push(url);
  };

  const handleCancelPrescription = async (id: number) => {
    if (confirm("Are you sure you want to cancel this prescription?")) {
      try {
        await cancelPrescription(id);
        // Update the local state
        setPrescriptions(prescriptions.map(p => 
          p.id === id ? { ...p, status: "cancelled" as PrescriptionStatus } : p
        ));
      } catch (err) {
        console.error("Failed to cancel prescription:", err);
        alert("Failed to cancel prescription. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-300">
        <CardHeader>
          <CardTitle className="flex items-center text-red-500">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Prescriptions</h3>
        <Button onClick={handleCreatePrescription} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Prescription
        </Button>
      </div>

      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No prescriptions found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base flex items-center">
                    <Pill className="mr-2 h-4 w-4" />
                    {prescription.drug_name}
                  </CardTitle>
                  <Badge className={statusColors[prescription.status]}>
                    {prescription.status}
                  </Badge>
                </div>
                <CardDescription>
                  Prescribed on {format(new Date(prescription.prescribed_date), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Dosage:</span> {prescription.dosage}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Frequency:</span> {prescription.frequency}
                    </p>
                  </div>
                  <div>
                    {prescription.duration && (
                      <p className="text-sm">
                        <span className="font-medium">Duration:</span> {prescription.duration}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">Refills:</span> {prescription.refills}
                    </p>
                  </div>
                </div>
                {prescription.instructions && (
                  <p className="text-sm mt-2">
                    <span className="font-medium">Instructions:</span> {prescription.instructions}
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-0 flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                {prescription.status === "active" && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleCancelPrescription(prescription.id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
