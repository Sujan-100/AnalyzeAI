import { createContext, useContext, useState, ReactNode } from "react";

export type ModelLabel = "BART" | "T5" | "Gemini";

export type ModelScore = {
  ROUGE: number;
  BLEU: number;
  Combined: number;
  riskRating?: string;
};

type AppState = {
  extractedText: string;
  summaries: Partial<Record<ModelLabel, string>>;
  scores: Partial<Record<ModelLabel, ModelScore>>;
  selectedModel: ModelLabel;
  chatHistory: { role: "user" | "bot"; text: string }[];
  documents: { id: string; name: string; date: string; model: string }[];
  uploadedFileName: string;
};

type AppContextType = {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
};

const defaultState: AppState = {
  extractedText: "",
  summaries: {},
  scores: {},
  selectedModel: "BART",
  chatHistory: [],
  documents: [],
  uploadedFileName: "",
};

const AppStateContext = createContext<AppContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const updateState = (updates: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AppStateContext.Provider value={{ state, updateState }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used within AppStateProvider");
  return context;
}
