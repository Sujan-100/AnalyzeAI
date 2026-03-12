import { useState } from "react";
import { 
  LayoutDashboard, 
  UploadCloud, 
  AlignLeft, 
  BarChart2, 
  MessageSquare, 
  History, 
  Info,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "upload", label: "Upload", icon: UploadCloud },
    { id: "summarize", label: "Summarize", icon: AlignLeft },
    { id: "analysis", label: "Analysis", icon: BarChart2 },
    { id: "chatbot", label: "Chatbot", icon: MessageSquare },
    { id: "history", label: "History", icon: History },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-card border-border"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-primary-foreground font-black">
                AI
              </div>
              Nexus
            </h1>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-primary/10 text-primary border border-primary/30 border-glow shadow-[0_0_15px_rgba(0,242,254,0.1)]' 
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 mt-auto">
            <button
              onClick={() => setActiveTab("about")}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${activeTab === "about"
                  ? 'bg-primary/10 text-primary border border-primary/30 border-glow' 
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }
              `}
            >
              <Info className="h-5 w-5" />
              <span className="font-medium">About</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
