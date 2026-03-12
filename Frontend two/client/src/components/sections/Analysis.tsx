import { useAppState } from "@/context/AppStateContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Analysis() {
  const { state } = useAppState();

  const data = Object.entries(state.scores).map(([model, scores]) => ({
    name: model,
    ROUGE: (scores?.ROUGE ?? 0) * 100,
    BLEU: (scores?.BLEU ?? 0) * 100,
    Combined: (scores?.Combined ?? 0) * 100,
    riskRating: scores?.riskRating || "N/A",
  }));

  if (data.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-3xl font-bold mb-2">Model Analysis</h2>
          <p className="text-muted-foreground">Run summarization first to generate comparison metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold mb-2">Model Analysis</h2>
        <p className="text-muted-foreground">Compare performance metrics across different AI models.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 hover-card-glow h-[450px]">
        <h3 className="text-xl font-bold mb-6">Performance Comparison</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dx={-10} />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
              itemStyle={{ fontWeight: 500 }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar dataKey="ROUGE" fill="hsl(180 100% 50%)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="BLEU" fill="hsl(195 100% 50%)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Combined" fill="hsl(215 14% 65%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden hover-card-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-background/50 border-b border-border">
              <tr>
                <th className="p-5 font-semibold text-muted-foreground">Model</th>
                <th className="p-5 font-semibold text-muted-foreground">Retention (%)</th>
                <th className="p-5 font-semibold text-muted-foreground">Readability (%)</th>
                <th className="p-5 font-semibold text-muted-foreground">Combined (%)</th>
                <th className="p-5 font-semibold text-muted-foreground">Risk Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.name} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="p-5 font-medium">{row.name}</td>
                  <td className="p-5 text-muted-foreground">{row.ROUGE.toFixed(1)}</td>
                  <td className="p-5 text-muted-foreground">{row.BLEU.toFixed(1)}</td>
                  <td className="p-5 text-primary font-bold">{row.Combined.toFixed(1)}</td>
                  <td className="p-5 text-muted-foreground">{row.riskRating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
