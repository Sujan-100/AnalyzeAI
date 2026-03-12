import { useAppState } from "@/context/AppStateContext";
import { FileText, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HistorySection() {
  const { state, updateState } = useAppState();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    updateState({
      documents: state.documents.filter(doc => doc.id !== id)
    });
    toast({ description: "Document deleted from history." });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold mb-2">Document History</h2>
        <p className="text-muted-foreground">Access previously analyzed documents and summaries.</p>
      </div>

      <div className="space-y-4">
        {state.documents.map((doc) => (
          <div 
            key={doc.id} 
            className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between hover-card-glow group transition-all duration-300"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <FileText size={26} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1">{doc.name}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{doc.date}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-border" />
                  <span className="px-2 py-0.5 rounded-md bg-background border border-border text-xs font-medium uppercase tracking-wider">Model: {doc.model}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                className="p-2.5 bg-background border border-border rounded-xl hover:border-primary hover:text-primary transition-all shadow-sm"
                title="Reload context"
              >
                <RefreshCw size={18} />
              </button>
              <button 
                onClick={() => handleDelete(doc.id)}
                className="p-2.5 bg-background border border-border rounded-xl hover:border-destructive hover:text-destructive hover:bg-destructive/10 transition-all shadow-sm"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {state.documents.length === 0 && (
          <div className="text-center p-16 bg-card border border-border rounded-2xl border-dashed flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No documents yet</h3>
            <p className="text-muted-foreground">Upload and analyze documents to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}