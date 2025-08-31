"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getPatients } from "@/lib/api/patients";
import { Patient } from "@/types/patients";

export function PatientSelector() {
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");
  
  const selectedPatient = patients.find(
    (patient) => patient.id.toString() === patientId
  );

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);
        const data = await getPatients();
        setPatients(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load patients:", err);
        setError("Failed to load patients. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, []);

  const handlePatientSelect = (patientId: string) => {
    router.push(`/clinical-records?patientId=${patientId}`);
    setOpen(false);
  };

  return (
    <div className="w-full max-w-sm">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            {loading
              ? "Loading patients..."
              : selectedPatient
              ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
              : "Select patient..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search patients..." />
            <CommandEmpty>
              {error ? error : "No patients found."}
            </CommandEmpty>
            <CommandGroup>
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.id.toString()}
                  onSelect={handlePatientSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      patient.id.toString() === patientId
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {patient.first_name} {patient.last_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
