// src/components/admin/AdminDocumentList.tsx
import { useState } from "react";
import { CheckCircle, XCircle, FileText, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api";

interface AdminDocumentListProps {
    documents: any[];
    onUpdate: () => void;
}

const AdminDocumentList = ({ documents, onUpdate }: AdminDocumentListProps) => {
    const [remarks, setRemarks] = useState<{ [key: number]: string }>({});
    const [isProcessing, setIsProcessing] = useState<number | null>(null);
    const [isViewing, setIsViewing] = useState<number | null>(null); // Track viewing state

    const handleVerify = async (documentId: number, status: "VERIFIED" | "REJECTED") => {
        setIsProcessing(documentId);
        try {
            const note = remarks[documentId];
            await PrymeAPI.verifyDocument(documentId, status, note);

            toast({
                title: `Document ${status}`,
                description: `The document has been successfully marked as ${status.toLowerCase()}.`,
                variant: status === "REJECTED" ? "destructive" : "default"
            });

            onUpdate(); // Refresh the application data
        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsProcessing(null);
        }
    };

    // Securely view the document
    const handleViewDocument = async (documentId: number) => {
        setIsViewing(documentId);
        try {
            await PrymeAPI.viewDocument(documentId);
        } catch (error: any) {
            toast({
                title: "Failed to open document",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsViewing(null);
        }
    };

    return (
        <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-foreground">Uploaded Documents</h3>
            {(!documents || documents.length === 0) && (
                <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            )}

            {documents?.map((doc) => (
                <div key={doc.id} className="p-4 border border-border/50 rounded-xl bg-card flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{doc.name || doc.type || "Document"}</p>
                            <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    doc.status === 'VERIFIED' ? 'bg-success/10 text-success' :
                        doc.status === 'REJECTED' ? 'bg-destructive/10 text-destructive' :
                            'bg-warning/10 text-warning'
                }`}>
                  {doc.status || "PENDING"}
                </span>
                                {doc.uploadedAt && (
                                    <span className="text-xs text-muted-foreground">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="flex items-center gap-2 w-full md:w-auto">

                        {/* NEW: View Document Button (Always visible) */}
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleViewDocument(doc.id)}
                            disabled={isViewing === doc.id}
                            title="View Document"
                        >
                            {isViewing === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                            <span className="ml-2 hidden sm:inline">View</span>
                        </Button>

                        {/* Approval/Rejection Controls (Only visible if PENDING) */}
                        {doc.status === 'PENDING' && (
                            <>
                                <Input
                                    placeholder="Optional remarks..."
                                    className="h-9 text-sm w-32 md:w-48"
                                    value={remarks[doc.id] || ""}
                                    onChange={(e) => setRemarks({...remarks, [doc.id]: e.target.value})}
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-success text-success hover:bg-success/10"
                                    onClick={() => handleVerify(doc.id, "VERIFIED")}
                                    disabled={isProcessing === doc.id}
                                    title="Approve"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-destructive text-destructive hover:bg-destructive/10"
                                    onClick={() => handleVerify(doc.id, "REJECTED")}
                                    disabled={isProcessing === doc.id}
                                    title="Reject"
                                >
                                    <XCircle className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>

                    {doc.status !== 'PENDING' && doc.adminRemarks && (
                        <div className="text-sm text-muted-foreground italic bg-muted/30 p-2 rounded-md mt-2 md:mt-0">
                            Note: {doc.adminRemarks}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AdminDocumentList;