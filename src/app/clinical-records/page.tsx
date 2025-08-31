"use client";

import { useSearchParams } from "next/navigation";
import { PatientSelector } from "@/components/clinical-records/patient-selector";
import { VisitNotesList } from "@/components/clinical-records/visit-notes-list";
import { VisitNoteDetail } from "@/components/clinical-records/visit-note-detail";

export default function ClinicalRecordsPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const visitNoteId = searchParams.get("visitNoteId");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clinical Records</h1>
      </div>

      <div className="mb-6">
        <PatientSelector />
      </div>

      {patientId ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <VisitNotesList patientId={parseInt(patientId)} />
          </div>

          <div className="md:col-span-2">
            {visitNoteId ? (
              <VisitNoteDetail
                visitNoteId={parseInt(visitNoteId)}
                patientId={parseInt(patientId)}
              />
            ) : (
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Select a visit note to view details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Please select a patient to view their clinical records.</p>
          </div>
        </div>
      )}
    </div>
  );
}
