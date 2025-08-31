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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Edit, 
  Trash2, 
  FileText, 
  Pill, 
  Receipt, 
  FileUp 
} from "lucide-react";
import { getVisitNote } from "@/lib/api/visit-notes";
import { VisitNoteWithRelations } from "@/types/visit-notes";
import { PrescriptionsList } from "./prescriptions-list";
import { PaymentsList } from "./payments-list";
import { DocumentsList } from "./documents-list";

interface VisitNoteDetailProps {
  visitNoteId: number;
  patientId: number;
}

const statusColors = {
  draft: "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

export function VisitNoteDetail({ visitNoteId, patientId }: VisitNoteDetailProps) {
  const [visitNote, setVisitNote] = useState<VisitNoteWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    async function loadVisitNote() {
      try {
        setLoading(true);
        const data = await getVisitNote(visitNoteId);
        setVisitNote(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load visit note:", err);
        setError("Failed to load visit note details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (visitNoteId) {
      loadVisitNote();
    }
  }, [visitNoteId]);

  const handleEdit = () => {
    router.push(`/clinical-records/visit-notes/${visitNoteId}/edit?patientId=${patientId}`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !visitNote) {
    return (
      <Card className="border-red-300">
        <CardHeader>
          <CardTitle className="flex items-center text-red-500">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || "Visit note not found"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                {visitNote.chief_complaint || `Visit Note #${visitNote.id}`}
              </CardTitle>
              <CardDescription>
                {format(new Date(visitNote.created_at), "PPP")}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={statusColors[visitNote.status]}>
                {visitNote.status}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Clinical Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Clinical Information</h4>
              <dl className="space-y-2">
                {visitNote.chief_complaint && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Chief Complaint</dt>
                    <dd>{visitNote.chief_complaint}</dd>
                  </div>
                )}
                {visitNote.diagnosis && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Diagnosis</dt>
                    <dd>{visitNote.diagnosis}</dd>
                  </div>
                )}
                {visitNote.treatment && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Treatment</dt>
                    <dd>{visitNote.treatment}</dd>
                  </div>
                )}
                {visitNote.notes && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                    <dd>{visitNote.notes}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div>
              <h4 className="font-medium mb-2">Vital Signs</h4>
              <dl className="space-y-2">
                {visitNote.blood_pressure && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Blood Pressure</dt>
                    <dd>{visitNote.blood_pressure}</dd>
                  </div>
                )}
                {visitNote.heart_rate && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Heart Rate</dt>
                    <dd>{visitNote.heart_rate} bpm</dd>
                  </div>
                )}
                {visitNote.temperature && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Temperature</dt>
                    <dd>{visitNote.temperature}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Records Tabs */}
      <Tabs defaultValue="prescriptions">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="prescriptions" className="flex items-center">
            <Pill className="mr-2 h-4 w-4" />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center">
            <Receipt className="mr-2 h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center">
            <FileUp className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>
        <TabsContent value="prescriptions" className="mt-4">
          <PrescriptionsList 
            patientId={patientId} 
            visitNoteId={visitNoteId} 
            initialPrescriptions={visitNote.prescriptions} 
          />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <PaymentsList 
            patientId={patientId} 
            visitNoteId={visitNoteId} 
            initialPayments={visitNote.payments} 
          />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentsList patientId={patientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
