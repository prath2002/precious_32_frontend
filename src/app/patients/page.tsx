"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth/store";
import { getPatientsWithToken } from "@/lib/api/patients";
import { Patient } from "@/types/patient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { PlusIcon, SearchIcon } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { token } = useAuthStore();
  const router = useRouter();
  // Using sonner toast directly

  useEffect(() => {
    const fetchPatients = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const data = await getPatientsWithToken(token, debouncedSearchTerm);
        setPatients(data);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
        toast.error("Failed to fetch patients. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [token, debouncedSearchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleViewPatient = (patientId: number) => {
    router.push(`/patients/${patientId}`);
  };

  const handleAddPatient = () => {
    router.push("/patients/new");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <Button onClick={handleAddPatient}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search patients by name, email, or phone..."
          className="pl-10"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Loading patients...
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  {searchTerm
                    ? "No patients found matching your search."
                    : "No patients found. Add your first patient!"}
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.first_name} {patient.last_name}
                  </TableCell>
                  <TableCell>
                    {new Date(patient.date_of_birth).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="capitalize">
                    {patient.gender ? patient.gender.toLowerCase() : "-"}
                  </TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.email || "-"}</TableCell>
                  <TableCell>
                    {patient.address
                      ? `${patient.address}, ${patient.city || ""} ${
                          patient.state || ""
                        } ${patient.postal_code || ""}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPatient(patient.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
