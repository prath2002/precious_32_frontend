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
  Receipt, 
  CreditCard, 
  DollarSign 
} from "lucide-react";
import { getPayments, getPatientBalance } from "@/lib/api/payments";
import { Payment, PaymentStatus, PatientBalance } from "@/types/payments";

interface PaymentsListProps {
  patientId: number;
  visitNoteId?: number;
  initialPayments?: Payment[];
}

const statusColors: Record<PaymentStatus, string> = {
  pending: "bg-yellow-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
  refunded: "bg-blue-500",
};

const paymentMethodIcons = {
  cash: DollarSign,
  credit_card: CreditCard,
  debit_card: CreditCard,
  insurance: Receipt,
  check: Receipt,
  bank_transfer: Receipt,
  other: Receipt,
};

export function PaymentsList({ 
  patientId, 
  visitNoteId, 
  initialPayments 
}: PaymentsListProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments || []);
  const [balance, setBalance] = useState<PatientBalance | null>(null);
  const [loading, setLoading] = useState(!initialPayments);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load payments if not provided
        if (!initialPayments) {
          const paymentsData = await getPayments(
            visitNoteId ? undefined : patientId, 
            visitNoteId
          );
          setPayments(paymentsData);
        }
        
        // Load balance
        if (!visitNoteId) {
          const balanceData = await getPatientBalance(patientId);
          setBalance(balanceData);
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to load payments data:", err);
        setError("Failed to load payments data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [patientId, visitNoteId, initialPayments]);

  const handleCreatePayment = () => {
    const url = `/clinical-records/payments/new?patientId=${patientId}${
      visitNoteId ? `&visitNoteId=${visitNoteId}` : ""
    }`;
    router.push(url);
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

  // Format currency
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Payments</h3>
        <Button onClick={handleCreatePayment} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Payment
        </Button>
      </div>

      {/* Balance Summary (only show when viewing all patient payments) */}
      {balance && !visitNoteId && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Charges</p>
                <p className="text-lg font-medium">{formatCurrency(balance.total_charges)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-lg font-medium">{formatCurrency(balance.total_payments)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <p className={`text-lg font-medium ${parseFloat(balance.outstanding_balance) > 0 ? 'text-red-500' : ''}`}>
                  {formatCurrency(balance.outstanding_balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {payments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No payments found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const PaymentIcon = paymentMethodIcons[payment.payment_method];
            
            return (
              <Card key={payment.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <PaymentIcon className="mr-2 h-4 w-4" />
                      <div>
                        <CardTitle className="text-base">
                          {formatCurrency(payment.amount)}
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(payment.payment_date), "PPP")}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={statusColors[payment.status]}>
                      {payment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">Method:</span> {payment.payment_method.replace('_', ' ')}
                      </p>
                    </div>
                    {payment.reference_number && (
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Reference:</span> {payment.reference_number}
                        </p>
                      </div>
                    )}
                  </div>
                  {payment.notes && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Notes:</span> {payment.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
