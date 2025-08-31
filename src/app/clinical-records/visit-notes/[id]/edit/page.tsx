"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { getVisitNote, updateVisitNote } from "@/lib/api/visit-notes";
import { VisitNote, VisitNoteStatus, VisitNoteUpdate } from "@/types/visit-notes";
import { getPatient } from "@/lib/api/patients";
import { Patient } from "@/types/patients";

interface EditVisitNotePageProps {
  params: {
    id: string;
  };
}

export default function EditVisitNotePage({ params }: EditVisitNotePageProps) {
  const visitNoteId = parseInt(params.id);
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  
  const [visitNote, setVisitNote] = useState<VisitNote | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState<number | undefined>(undefined);
  const [temperature, setTemperature] = useState("");
  const [status, setStatus] = useState<VisitNoteStatus>("draft");
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load visit note
        const visitNoteData = await getVisitNote(visitNoteId);
        setVisitNote(visitNoteData);
        
        // Set form values
        setChiefComplaint(visitNoteData.chief_complaint || "");
        setDiagnosis(visitNoteData.diagnosis || "");
        setTreatment(visitNoteData.treatment || "");
        setNotes(visitNoteData.notes || "");
        setBloodPressure(visitNoteData.blood_pressure || "");
        setHeartRate(visitNoteData.heart_rate);
        setTemperature(visitNoteData.temperature || "");
        setStatus(visitNoteData.status);
        
        // Load patient
        const patientData = await getPatient(visitNoteData.patient_id);
        setPatient(patientData);
        
        setError(null);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load visit note data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [visitNoteId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!visitNote) {
      setError("Visit note data is missing.");
      return;
    }
    
    try {
      setSaving(true);
      
      const visitNoteData: VisitNoteUpdate = {
        chief_complaint: chiefComplaint || undefined,
        diagnosis: diagnosis || undefined,
        treatment: treatment || undefined,
        notes: notes || undefined,
        blood_pressure: bloodPressure || undefined,
        heart_rate: heartRate,
        temperature: temperature || undefined,
        status
      };
      
      await updateVisitNote(visitNoteId, visitNoteData);
      
      // Redirect to the visit note detail page
      router.push(`/clinical-records?patientId=${visitNote.patient_id}&visitNoteId=${visitNoteId}`);
    } catch (err) {
      console.error("Failed to update visit note:", err);
      setError("Failed to update visit note. Please try again.");
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Edit Visit Note</h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Loading visit note data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error && !visitNote) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Edit Visit Note</h1>
        </div>
        
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
          <CardFooter>
            <Button onClick={() => router.push("/clinical-records")}>
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Visit Note</h1>
        </div>
      </div>
      
      {patient && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>
              Editing visit note for {patient.first_name} {patient.last_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p>{patient.first_name} {patient.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Date of Birth</p>
                <p>{new Date(patient.date_of_birth).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Clinical Information</CardTitle>
            <CardDescription>
              Edit the clinical details for this visit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">Chief Complaint</Label>
              <Input
                id="chiefComplaint"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Patient's main concern"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Clinical diagnosis"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment</Label>
              <Textarea
                id="treatment"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="Treatment plan"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Vital Signs</CardTitle>
            <CardDescription>
              Record the patient's vital signs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodPressure">Blood Pressure</Label>
                <Input
                  id="bloodPressure"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="e.g. 120/80"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={heartRate || ""}
                  onChange={(e) => setHeartRate(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g. 72"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="e.g. 98.6°F"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              Set the status of this visit note
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as VisitNoteStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Visit Note"}
            </Button>
          </CardFooter>
        </Card>
        
        {error && (
          <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50 text-red-500">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
