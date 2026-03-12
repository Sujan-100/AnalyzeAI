import { useRef, useState } from "react";
import { UploadCloud, File, X } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import { useToast } from "@/hooks/use-toast";
import { uploadDocument } from "@/lib/api";

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, updateState } = useAppState();
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setProgress(10);

    const progressTimer = window.setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 10));
    }, 250);

    try {
      const data = await uploadDocument(file);
      updateState({
        extractedText: data.text,
        uploadedFileName: file.name,
        documents: [
          {
            id: `${Date.now()}`,
            name: file.name,
            date: new Date().toLocaleDateString(),
            model: state.selectedModel,
          },
          ...state.documents,
        ],
      });

      toast({
        title: "Upload Complete",
        description: "Document text extracted successfully.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      window.clearInterval(progressTimer);
      setProgress(100);
      window.setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 300);
    }
  };

  const onFileSelected = (file?: File) => {
    if (!file || isUploading) return;
    void handleFileUpload(file);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Upload Document</h2>
        <p className="text-muted-foreground">Upload a PDF to extract text and prepare for analysis.</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => onFileSelected(e.target.files?.[0])}
      />

      <div
        className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-white/5"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          onFileSelected(e.dataTransfer.files?.[0]);
        }}
        onClick={!isUploading ? () => fileInputRef.current?.click() : undefined}
      >
        {isUploading ? (
          <div className="w-full max-w-md space-y-4">
            <div className="text-primary mb-4 animate-bounce">
              <UploadCloud size={48} className="mx-auto" />
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-200 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Processing... {progress}%</p>
          </div>
        ) : (
          <div className="cursor-pointer">
            <div className="w-20 h-20 bg-card border border-border rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Click or drag document here</h3>
            <p className="text-muted-foreground mb-6">Supports PDF, DOCX up to 10MB</p>
            <button
              type="button"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity border-glow"
              data-testid="button-upload"
            >
              Select File
            </button>
          </div>
        )}
      </div>

      {state.extractedText && (
        <div className="bg-card border border-border rounded-2xl p-6 hover-card-glow animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <File className="text-primary" size={20} />
              <h3 className="font-bold text-lg">Extracted Text</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{state.extractedText.split(" ").length} words</span>
              <span>{state.extractedText.length} chars</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateState({ extractedText: "" });
                }}
                className="hover:text-destructive transition-colors p-1"
                data-testid="button-clear-text"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="bg-background rounded-xl p-4 max-h-60 overflow-y-auto custom-scrollbar border border-border">
            <p className="text-muted-foreground leading-relaxed">{state.extractedText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
