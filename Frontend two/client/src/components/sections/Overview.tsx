import { FileText, Zap, CheckCircle2 } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Overview() {
  const { state } = useAppState();

  const data = [
    { name: 'Mon', count: 4 },
    { name: 'Tue', count: 7 },
    { name: 'Wed', count: 5 },
    { name: 'Thu', count: 12 },
    { name: 'Fri', count: 8 },
    { name: 'Sat', count: 2 },
    { name: 'Sun', count: 3 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back, <span className="text-primary-gradient">User</span></h2>
        <p className="text-muted-foreground">Here is an overview of your document analysis activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl hover-card-glow transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Total Documents</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileText size={20} />
            </div>
          </div>
          <div className="text-4xl font-bold">{state.documents.length}</div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl hover-card-glow transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Last Model Used</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Zap size={20} />
            </div>
          </div>
          <div className="text-4xl font-bold">{state.selectedModel}</div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl hover-card-glow transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Best Performing</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-4xl font-bold">Gemini</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 hover-card-glow">
        <h3 className="text-xl font-bold mb-6">Activity Preview</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: 'hsl(var(--muted))'}}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}