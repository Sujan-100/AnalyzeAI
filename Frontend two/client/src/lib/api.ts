export type RetentionData = {
  entity_count_total: number;
  entity_count_retained: number;
  risk_rating: string;
};

export type SummaryMetrics = {
  word_count_original: number;
  word_count_summary: number;
  information_density: number;
  readability_grade: number;
  retention_data: RetentionData;
};

export type SummarizeResponse = {
  model: string;
  summary: string;
  metrics: SummaryMetrics;
};

export type CompareResult = {
  model: string;
  summary?: string;
  metrics?: SummaryMetrics;
  error?: string;
};

const apiBase = window.location.origin;

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Request failed");
  }
  return data;
}

export async function uploadDocument(file: File): Promise<{ text: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${apiBase}/upload`, {
    method: "POST",
    body: formData,
  });

  return parseJson<{ text: string }>(res);
}

export async function summarizeText(
  text: string,
  model: "bart" | "t5" | "gemini-2.5-pro",
): Promise<SummarizeResponse> {
  const res = await fetch(`${apiBase}/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, model }),
  });

  return parseJson<SummarizeResponse>(res);
}

export async function compareModels(text: string): Promise<{ results: CompareResult[] }> {
  const res = await fetch(`${apiBase}/compare_models_full`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  return parseJson<{ results: CompareResult[] }>(res);
}

export async function chatWithDocument(prompt: string): Promise<{ response: string }> {
  const res = await fetch(`${apiBase}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  return parseJson<{ response: string }>(res);
}
