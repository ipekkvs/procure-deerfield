import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Upload, X, FileText, FileSpreadsheet, FileImage, File, Check, AlertCircle } from "lucide-react";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  errorMessage?: string;
}

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/zip',
  'application/x-zip-compressed',
];

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="w-5 h-5 text-destructive" />;
  if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-status-success" />;
  if (type.includes('image')) return <FileImage className="w-5 h-5 text-primary" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
};

export function FileUpload({ 
  files, 
  onFilesChange, 
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  className 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (file: File): Promise<UploadedFile> => {
    return new Promise((resolve) => {
      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading',
      };

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve({
            ...uploadedFile,
            progress: 100,
            status: 'complete',
          });
        } else {
          onFilesChange([...files, { ...uploadedFile, progress }]);
        }
      }, 200);
    });
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File exceeds ${formatFileSize(maxFileSize)} limit`;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'File type not supported';
    }
    return null;
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const error = validateFile(file);

      if (error) {
        newFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: 'error',
          errorMessage: error,
        });
      } else {
        const uploadedFile = await simulateUpload(file);
        newFiles.push(uploadedFile);
      }
    }

    onFilesChange([...files, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragging 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <Upload className={cn(
          "w-8 h-8 mx-auto mb-2 transition-colors",
          isDragging ? "text-primary" : "text-muted-foreground"
        )} />
        <p className="text-sm font-medium">
          {isDragging ? "Drop files here" : "Drag & drop files here, or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP up to 10MB
        </p>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                file.status === 'error' 
                  ? "bg-destructive/5 border-destructive/30" 
                  : file.status === 'complete'
                  ? "bg-status-success-bg border-status-success/30"
                  : "bg-muted/50 border-muted"
              )}
            >
              {getFileIcon(file.type)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-1 w-20" />
                  )}
                  {file.status === 'error' && (
                    <span className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {file.errorMessage}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {file.status === 'complete' && (
                  <Check className="w-4 h-4 text-status-success" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            className="mt-2"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload More Files
          </Button>
        </div>
      )}
    </div>
  );
}
