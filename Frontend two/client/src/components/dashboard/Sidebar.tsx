import { LayoutDashboard, Upload, FileText, BarChart2, MessageSquare, History, Info, X, Hexagon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: any) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'summarize', label: 'Summarize', icon: FileText },
    { id: 'analysis', label: 'Analysis', icon: BarChart2 },
    { id: 'chatbot', label: 'Chatbot', icon: MessageSquare },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-full
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center border-glow">
              <Hexagon className="text-primary-foreground h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary-gradient">NexusAI</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-primary/10 text-primary border-glow shadow-[0_0_15px_hsla(var(--primary)/0.1)]' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-border mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold border border-border">
              JD
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Jane Doe</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
