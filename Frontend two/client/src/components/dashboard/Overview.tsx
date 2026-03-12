import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Upload, FileText, MessageSquare, BrainCircuit, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Overview({ setTab, appState }: any) {
  const chartData = [
    { name: 'Mon', usage: 12 },
    { name: 'Tue', usage: 19 },
    { name: 'Wed', usage: 15 },
    { name: 'Thu', usage: 22 },
    { name: 'Fri', usage: 28 },
    { name: 'Sat', usage: 10 },
    { name: 'Sun', usage: 5 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Welcome back, Jane</h1>
        <p className="text-muted-foreground text-lg">Here's what's happening with your documents today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border hover-card-glow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-muted-foreground">Total Documents</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-4xl font-bold">{appState.documents.length}</p>
          <p className="text-sm text-primary mt-2 flex items-center gap-1">
            <span className="text-glow">+2 this week</span>
          </p>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border hover-card-glow cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-muted-foreground">Last Summary Model</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BrainCircuit className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-4xl font-bold">{appState.selectedModel}</p>
          <p className="text-sm text-muted-foreground mt-2">Used yesterday</p>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border hover-card-glow cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-medium text-muted-foreground">Best Performing Model</h3>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-4xl font-bold relative z-10">Gemini</p>
          <p className="text-sm text-primary mt-2 relative z-10 text-glow">92% ROUGE Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-semibold mb-6">Usage Overview</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border flex flex-col">
          <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <Button 
              className="w-full justify-start h-14 text-lg border-glow bg-primary/10 text-primary hover:bg-primary/20" 
              variant="outline"
              onClick={() => setTab('upload')}
            >
              <Upload className="mr-3 h-5 w-5" /> Upload Document
            </Button>
            <Button 
              className="w-full justify-start h-14 text-lg border-border hover:bg-muted" 
              variant="outline"
              onClick={() => setTab('summarize')}
            >
              <FileText className="mr-3 h-5 w-5" /> Generate Summary
            </Button>
            <Button 
              className="w-full justify-start h-14 text-lg border-border hover:bg-muted" 
              variant="outline"
              onClick={() => setTab('chatbot')}
            >
              <MessageSquare className="mr-3 h-5 w-5" /> Ask Chatbot
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
