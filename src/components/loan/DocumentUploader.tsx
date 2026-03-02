// src/components/loan/DocumentUploader.tsx
import { useState } from "react";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api";

interface DocumentUploaderProps {
    applicationId: number;
    documentType: string;
    label: string;
    onUploadSuccess?: () => void;
}

const DocumentUploader = ({ applicationId, documentType, label, onUploadSuccess }: DocumentUploaderProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Frontend validation matching Spring Boot's 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File too large", description: "Must be less than 5MB", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        try {
            await PrymeAPI.uploadDocument(file, applicationId, documentType);

            setIsSuccess(true);
            toast({ title: "Upload Successful", description: `${label} has been securely uploaded.` });

            if (onUploadSuccess) onUploadSuccess();

        } catch (error: any) {
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card/50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG or PNG (Max 5MB)</p>
                </div>
            </div>

            <div>
                {isSuccess ? (
                    <div className="flex items-center gap-2 text-success">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Uploaded</span>
                    </div>
                ) : (
                    <div className="relative">
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                        <Button variant="outline" size="sm" disabled={isUploading} className="pointer-events-none">
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentUploader;