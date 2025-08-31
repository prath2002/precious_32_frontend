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
  FileUp, 
  Download, 
  File, 
  FileImage, 
  FileText, 
  FileSpreadsheet 
} from "lucide-react";
import { getPatientDocuments, downloadDocument, deleteDocument } from "@/lib/api/documents";
import { Document, DocumentType } from "@/types/documents";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentsListProps {
  patientId: number;
}

const documentTypeIcons: Record<DocumentType, any> = {
  xray: FileImage,
  lab_result: FileSpreadsheet,
  consent_form: FileText,
  insurance: FileText,
  other: File,
};

export function DocumentsList({ patientId }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadType, setUploadType] = useState<DocumentType>("other");
  const [uploading, setUploading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        const data = await getPatientDocuments(patientId);
        setDocuments(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load documents:", err);
        setError("Failed to load documents. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      loadDocuments();
    }
  }, [patientId]);

  const handleDownload = async (id: number, filename: string) => {
    try {
      const blob = await downloadDocument(id);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download document:", err);
      alert("Failed to download document. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument(id);
        // Update the local state
        setDocuments(documents.filter(d => d.id !== id));
      } catch (err) {
        console.error("Failed to delete document:", err);
        alert("Failed to delete document. Please try again.");
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);
      
      // Call the API to upload the document
      const response = await fetch(`/api/v1/patients/${patientId}/documents`, {
        method: "POST",
        headers: {
          // Don't set Content-Type, let the browser set it with the boundary
        },
        body: (() => {
          const formData = new FormData();
          formData.append("file", uploadFile);
          formData.append("title", uploadTitle);
          formData.append("description", uploadDescription);
          formData.append("document_type", uploadType);
          return formData;
        })(),
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const newDocument = await response.json();
      
      // Update the local state
      setDocuments([newDocument, ...documents]);
      
      // Reset the form
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      setUploadType("other");
      
      // Close the dialog
      setUploadDialogOpen(false);
    } catch (err) {
      console.error("Failed to upload document:", err);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
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
        <h3 className="text-lg font-medium">Documents</h3>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a document for this patient.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input 
                  id="file" 
                  type="file" 
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={uploadTitle} 
                  onChange={(e) => setUploadTitle(e.target.value)} 
                  placeholder="Document title" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={uploadDescription} 
                  onChange={(e) => setUploadDescription(e.target.value)} 
                  placeholder="Document description" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Document Type</Label>
                <Select value={uploadType} onValueChange={(value) => setUploadType(value as DocumentType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xray">X-Ray</SelectItem>
                    <SelectItem value="lab_result">Lab Result</SelectItem>
                    <SelectItem value="consent_form">Consent Form</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No documents found for this patient.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => {
            const DocumentIcon = documentTypeIcons[document.document_type];
            
            return (
              <Card key={document.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base flex items-center">
                      <DocumentIcon className="mr-2 h-4 w-4" />
                      {document.title || document.filename}
                    </CardTitle>
                    <Badge>
                      {document.document_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription>
                    Uploaded on {format(new Date(document.upload_date), "PPP")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  {document.description && (
                    <p className="text-sm mb-2">{document.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {document.filename}
                    {document.file_size && (
                      <span> ({(document.file_size / 1024).toFixed(2)} KB)</span>
                    )}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(document.id, document.filename)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(document.id)}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
