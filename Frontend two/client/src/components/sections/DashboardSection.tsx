type AppState = {
  stats: {
    totalDocs: number;
    lastModel: string;
    bestModel: string;
  };
};
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Zap, Award, UploadCloud, AlignLeft, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardSectionProps {
  state: AppState;
  setActiveTab: (tab: string) => void;
}

export default function DashboardSection({ state, setActiveTab }: DashboardSectionProps) {
  const chartData = [
    { name: "Mon", docs: 1 },
    { name: "Tue", docs: 3 },
    { name: "Wed", docs: 2 },
    { name: "Thu", docs: 5 },
    { name: "Fri", docs: 4 },
    { name: "Sat", docs: 2 },
    { name: "Sun", docs: 1 },
  ];

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
      <div>
        <h2 className="text-4xl font-bold tracking-tight mb-2">Welcome back</h2>
        <p className="text-muted-foreground text-lg">Here's what's happening with your documents today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-xl border-white/5 hover-card-glow cursor-default">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-full text-muted-foreground">+12% this week</span>
            </div>
            <p className="text-muted-foreground font-medium mb-1">Total Documents</p>
            <h3 className="text-4xl font-bold">{state.stats.totalDocs}</h3>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-white/5 hover-card-glow cursor-default">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Zap className="w-6 h-6" />
              </div>
            </div>
            <p className="text-muted-foreground font-medium mb-1">Last Summary Model</p>
            <h3 className="text-3xl font-bold text-primary-gradient">{state.stats.lastModel}</h3>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-white/5 hover-card-glow cursor-default relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px]" />
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <p className="text-muted-foreground font-medium mb-1">Best Performing Model</p>
            <h3 className="text-3xl font-bold text-primary-gradient">{state.stats.bestModel}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-xl border-white/5 col-span-1 lg:col-span-2 p-6">
          <h3 className="text-xl font-bold mb-6">Activity Overview</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#161b22', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="docs" fill="hsl(180 100% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-card/50 backdrop-blur-xl border-white/5 p-6 flex flex-col justify-center gap-4">
          <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
          
          <Button 
            className="w-full justify-start gap-3 h-14 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/50 border border-transparent transition-all" 
            variant="ghost"
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud className="w-5 h-5" />
            <span className="font-semibold text-base">Upload Document</span>
          </Button>
          
          <Button 
            className="w-full justify-start gap-3 h-14 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/50 border border-transparent transition-all" 
            variant="ghost"
            onClick={() => setActiveTab('summarize')}
          >
            <AlignLeft className="w-5 h-5" />
            <span className="font-semibold text-base">Summarize Content</span>
          </Button>

          <Button 
            className="w-full justify-start gap-3 h-14 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary hover:border-primary/50 border border-transparent transition-all" 
            variant="ghost"
            onClick={() => setActiveTab('chatbot')}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold text-base">Chat with Document</span>
          </Button>
        </Card>
      </div>
    </div>
  );
}

