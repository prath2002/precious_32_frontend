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
import { createPrescription } from "@/lib/api/prescriptions";
import { PrescriptionCreate, PrescriptionStatus } from "@/types/prescriptions";
import { getPatient } from "@/lib/api/patients";
import { Patient } from "@/types/patients";

export default function NewPrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const visitNoteId = searchParams.get("visitNoteId");
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [drugName, setDrugName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [quantity, setQuantity] = useState("");
  const [refills, setRefills] = useState<number>(0);
  const [instructions, setInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<PrescriptionStatus>("active");
  
  useEffect(() => {
    async function loadPatient() {
      if (!patientId) return;
      
      try {
        setLoading(true);
        const data = await getPatient(parseInt(patientId));
        setPatient(data);
      } catch (err) {
        console.error("Failed to load patient:", err);
        setError("Failed to load patient information.");
      } finally {
        setLoading(false);
      }
    }
    
    loadPatient();
  }, [patientId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) {
      setError("Patient ID is required.");
      return;
    }
    
    if (!drugName) {
      setError("Drug name is required.");
      return;
    }
    
    if (!dosage) {
      setError("Dosage is required.");
      return;
    }
    
    if (!frequency) {
      setError("Frequency is required.");
      return;
    }
    
    try {
      setSaving(true);
      
      const prescriptionData: PrescriptionCreate = {
        patient_id: parseInt(patientId),
        visit_note_id: visitNoteId ? parseInt(visitNoteId) : undefined,
        drug_name: drugName,
        dosage,
        frequency,
        duration: duration || undefined,
        quantity: quantity || undefined,
        refills,
        instructions: instructions || undefined,
        notes: notes || undefined,
        status
      };
      
      await createPrescription(prescriptionData);
      
      // Redirect back to the visit note or patient record
      if (visitNoteId) {
        router.push(`/clinical-records?patientId=${patientId}&visitNoteId=${visitNoteId}`);
      } else {
        router.push(`/clinical-records?patientId=${patientId}`);
      }
    } catch (err) {
      console.error("Failed to create prescription:", err);
      setError("Failed to create prescription. Please try again.");
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  if (!patientId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">New Prescription</h1>
        </div>
        
        <Card className="border-red-300">
          <CardHeader>
            <CardTitle className="flex items-center text-red-500">
              <AlertCircle className="mr-2 h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Patient ID is required to create a prescription.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">New Prescription</h1>
        </div>
      </div>
      
      {patient && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>
              Creating a prescription for {patient.first_name} {patient.last_name}
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
            <CardTitle>Medication Details</CardTitle>
            <CardDescription>
              Enter the medication details for this prescription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="drugName">Drug Name *</Label>
              <Input
                id="drugName"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                placeholder="Enter drug name"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 500mg"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Input
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="e.g. Twice daily"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 7 days"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 14 tablets"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refills">Refills</Label>
              <Input
                id="refills"
                type="number"
                min="0"
                value={refills}
                onChange={(e) => setRefills(parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Instructions for the patient"
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
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              Set the status of this prescription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as PrescriptionStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
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
              {saving ? "Saving..." : "Save Prescription"}
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
