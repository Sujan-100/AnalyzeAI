import { useState } from "react";
import { Sparkles, Copy, Download, ChevronDown } from "lucide-react";
import { useAppState, type ModelLabel, type ModelScore } from "@/context/AppStateContext";
import { useToast } from "@/hooks/use-toast";
import { compareModels, summarizeText, type SummaryMetrics } from "@/lib/api";

const MODELS: ModelLabel[] = ["BART", "T5", "Gemini"];

function mapModelToBackend(model: ModelLabel): "bart" | "t5" | "gemini-2.5-pro" {
  if (model === "BART") return "bart";
  if (model === "T5") return "t5";
  return "gemini-2.5-pro";
}

function mapBackendToModel(model: string): ModelLabel {
  if (model.toLowerCase().includes("bart")) return "BART";
  if (model.toLowerCase() === "t5") return "T5";
  return "Gemini";
}

function toScore(metrics: SummaryMetrics): ModelScore {
  const total = metrics.retention_data.entity_count_total || 0;
  const retained = metrics.retention_data.entity_count_retained || 0;
  const retentionRatio = total > 0 ? retained / total : 0;
  const normalizedReadability = Math.max(0, Math.min(1, 1 - metrics.readability_grade / 20));
  const normalizedDensity = Math.max(0, Math.min(1, metrics.information_density / 100));

  return {
    ROUGE: retentionRatio,
    BLEU: normalizedReadability,
    Combined: (retentionRatio + normalizedReadability + normalizedDensity) / 3,
    riskRating: metrics.retention_data.risk_rating,
  };
}

export default function Summarize() {
  const { state, updateState } = useAppState();
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!state.extractedText) {
      toast({ title: "No text", description: "Please upload a document first.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const data = await summarizeText(state.extractedText, mapModelToBackend(state.selectedModel));
      const score = toScore(data.metrics);

      updateState({
        summaries: {
          ...state.summaries,
          [state.selectedModel]: data.summary,
        },
        scores: {
          ...state.scores,
          [state.selectedModel]: score,
        },
      });

      toast({ title: "Success", description: "Summary generated successfully." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Summary generation failed";
      toast({ title: "Failed", description: message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompareAll = async () => {
    if (!state.extractedText) {
      toast({ title: "No text", description: "Please upload a document first.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const data = await compareModels(state.extractedText);
      const summaries = { ...state.summaries };
      const scores = { ...state.scores };

      for (const result of data.results) {
        if (!result.summary || !result.metrics || result.error) {
          continue;
        }
        const model = mapBackendToModel(result.model);
        summaries[model] = result.summary;
        scores[model] = toScore(result.metrics);
      }

      updateState({ summaries, scores });
      toast({ title: "Success", description: "All model summaries generated." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Comparison failed";
      toast({ title: "Failed", description: message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const currentSummary = state.summaries[state.selectedModel];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Summarize</h2>
        <p className="text-muted-foreground">Generate concise summaries using state-of-the-art models.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 hover-card-glow">
            <h3 className="font-bold mb-6">Configuration</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Model</label>
                <div className="relative">
                  <button
                    onClick={() => setModelOpen(!modelOpen)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 flex items-center justify-between hover:border-primary/50 transition-colors"
                  >
                    <span>{state.selectedModel}</span>
                    <ChevronDown size={16} className={`transition-transform ${modelOpen ? "rotate-180" : ""}`} />
                  </button>

                  {modelOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-10 animate-in fade-in zoom-in-95">
                      {MODELS.map((model) => (
                        <button
                          key={model}
                          onClick={() => {
                            updateState({ selectedModel: model });
                            setModelOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-primary/10 hover:text-primary transition-colors ${state.selectedModel === model ? "bg-primary/5 text-primary font-medium" : ""}`}
                        >
                          {model}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={() => void handleGenerate()}
                  disabled={isGenerating || !state.extractedText}
                  className="w-full bg-primary text-primary-foreground font-medium rounded-xl py-3 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed border-glow"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    <>
                      <Sparkles size={18} /> Generate Summary
                    </>
                  )}
                </button>

                <button
                  onClick={() => void handleCompareAll()}
                  disabled={isGenerating || !state.extractedText}
                  className="w-full bg-transparent border border-primary text-primary font-medium rounded-xl py-3 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Compare All Models
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3">
          <div className="bg-card border border-border rounded-2xl p-6 min-h-[400px] flex flex-col hover-card-glow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
                Output ({state.selectedModel})
              </h3>

              {currentSummary && (
                <div className="flex items-center gap-2 animate-in fade-in">
                  <button className="p-2 bg-background border border-border hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                    <Copy size={16} />
                  </button>
                  <button className="p-2 bg-background border border-border hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                    <Download size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-background rounded-xl p-6 border border-border relative overflow-hidden">
              {isGenerating ? (
                <div className="absolute inset-0 p-6 space-y-4">
                  <div className="w-full h-full absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                  <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-muted/50 rounded w-full animate-pulse delay-75"></div>
                  <div className="h-4 bg-muted/50 rounded w-5/6 animate-pulse delay-150"></div>
                  <div className="h-4 bg-muted/50 rounded w-full animate-pulse delay-200"></div>
                  <div className="h-4 bg-muted/50 rounded w-2/3 animate-pulse delay-300"></div>
                </div>
              ) : currentSummary ? (
                <p className="text-foreground leading-relaxed animate-in fade-in">{currentSummary}</p>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-center">
                  <p>
                    Click "Generate Summary" to see the output here.
                    <br />
                    Requires an uploaded document.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
