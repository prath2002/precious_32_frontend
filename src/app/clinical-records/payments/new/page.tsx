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
import { createPayment } from "@/lib/api/payments";
import { PaymentCreate, PaymentMethod, PaymentStatus } from "@/types/payments";
import { getPatient } from "@/lib/api/patients";
import { Patient } from "@/types/patients";

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  const visitNoteId = searchParams.get("visitNoteId");
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [status, setStatus] = useState<PaymentStatus>("completed");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  
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
    
    if (!amount || isNaN(parseFloat(amount))) {
      setError("Valid amount is required.");
      return;
    }
    
    try {
      setSaving(true);
      
      const paymentData: PaymentCreate = {
        patient_id: parseInt(patientId),
        visit_note_id: visitNoteId ? parseInt(visitNoteId) : undefined,
        amount,
        payment_method: paymentMethod,
        status,
        reference_number: referenceNumber || undefined,
        notes: notes || undefined,
        payment_date: paymentDate ? new Date(paymentDate).toISOString() : undefined
      };
      
      await createPayment(paymentData);
      
      // Redirect back to the visit note or patient record
      if (visitNoteId) {
        router.push(`/clinical-records?patientId=${patientId}&visitNoteId=${visitNoteId}`);
      } else {
        router.push(`/clinical-records?patientId=${patientId}`);
      }
    } catch (err) {
      console.error("Failed to create payment:", err);
      setError("Failed to create payment. Please try again.");
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
          <h1 className="text-3xl font-bold tracking-tight">New Payment</h1>
        </div>
        
        <Card className="border-red-300">
          <CardHeader>
            <CardTitle className="flex items-center text-red-500">
              <AlertCircle className="mr-2 h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Patient ID is required to create a payment.</p>
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
          <h1 className="text-3xl font-bold tracking-tight">New Payment</h1>
        </div>
      </div>
      
      {patient && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>
              Recording a payment for {patient.first_name} {patient.last_name}
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
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Enter the payment details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">$</span>
                <Input
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as PaymentStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. Transaction ID, Check Number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this payment"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Record Payment"}
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
