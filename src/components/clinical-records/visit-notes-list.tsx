"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { PlusCircle, FileText, AlertCircle } from "lucide-react";
import { getVisitNotes } from "@/lib/api/visit-notes";
import { VisitNote, VisitNoteStatus } from "@/types/visit-notes";

interface VisitNotesListProps {
  patientId: number;
}

const statusColors: Record<VisitNoteStatus, string> = {
  draft: "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

export function VisitNotesList({ patientId }: VisitNotesListProps) {
  const [visitNotes, setVisitNotes] = useState<VisitNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const visitNoteId = searchParams.get("visitNoteId");

  useEffect(() => {
    async function loadVisitNotes() {
      try {
        setLoading(true);
        const data = await getVisitNotes(patientId);
        setVisitNotes(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load visit notes:", err);
        setError("Failed to load visit notes. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      loadVisitNotes();
    }
  }, [patientId]);

  const handleVisitNoteSelect = (id: number) => {
    router.push(`/clinical-records?patientId=${patientId}&visitNoteId=${id}`);
  };

  const handleCreateVisitNote = () => {
    router.push(`/clinical-records/visit-notes/new?patientId=${patientId}`);
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
        <h3 className="text-lg font-medium">Visit Notes</h3>
        <Button onClick={handleCreateVisitNote} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Visit Note
        </Button>
      </div>

      {visitNotes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No visit notes found for this patient.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visitNotes.map((note) => (
            <Card 
              key={note.id} 
              className={cn(
                "cursor-pointer hover:border-primary transition-colors",
                note.id.toString() === visitNoteId ? "border-primary" : ""
              )}
              onClick={() => handleVisitNoteSelect(note.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    {note.chief_complaint || `Visit Note #${note.id}`}
                  </CardTitle>
                  <Badge className={statusColors[note.status]}>
                    {note.status}
                  </Badge>
                </div>
                <CardDescription>
                  {format(new Date(note.created_at), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {note.diagnosis && (
                  <div className="mb-1">
                    <span className="font-medium">Diagnosis:</span> {note.diagnosis}
                  </div>
                )}
                {note.treatment && (
                  <div>
                    <span className="font-medium">Treatment:</span> {note.treatment}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to conditionally join classNames
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
