import { useState } from "react";
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  History, 
  Info,
  Menu
} from "lucide-react";
import Overview from "@/components/sections/Overview";
import Upload from "@/components/sections/Upload";
import Summarize from "@/components/sections/Summarize";
import Analysis from "@/components/sections/Analysis";
import Chatbot from "@/components/sections/Chatbot";
import HistorySection from "@/components/sections/History";

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, component: Overview },
  { id: 'upload', label: 'Upload', icon: UploadCloud, component: Upload },
  { id: 'summarize', label: 'Summarize', icon: FileText, component: Summarize },
  { id: 'analysis', label: 'Analysis', icon: BarChart3, component: Analysis },
  { id: 'chatbot', label: 'Chatbot', icon: MessageSquare, component: Chatbot },
  { id: 'history', label: 'History', icon: History, component: HistorySection },
  { id: 'about', label: 'About', icon: Info, component: () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">About This Project</h2>
        <p className="text-muted-foreground">AI Legal Document Analyzer</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 hover-card-glow">
        <div className="space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground">
          <p>
            The AI Legal Document Analyzer is an intelligent web-based platform designed to simplify the process of understanding
            complex legal and formal documents. Legal texts are often lengthy, technical, and difficult for users to interpret quickly.
            This project solves that problem by using modern Artificial Intelligence and Natural Language Processing techniques to
            automatically extract text from documents, generate concise summaries, analyze content using multiple AI models, and allow
            users to interact with the document through a smart chatbot.
          </p>
          <p>
            The system allows users to upload PDF documents, after which the platform extracts the text and processes it using advanced
            language models. Multiple AI models are used for summarization and analysis so that users can compare their performance and
            understand which model produces the most accurate and relevant summary. The application also provides visual insights through
            graphs and analysis tools, making the interpretation of model performance easier.
          </p>
          <p>
            In addition to summarization and analysis, the platform includes an AI-powered chatbot that answers user questions based only
            on the content of the uploaded document. This ensures that responses remain contextual and relevant to the specific document
            being analyzed.
          </p>
          <p>
            The goal of this project is to demonstrate how modern AI technologies can assist in document understanding, knowledge extraction,
            and intelligent information retrieval. It combines a user-friendly interface with powerful backend AI models to create a practical
            tool for analyzing large textual documents efficiently.
          </p>
          <p className="text-foreground font-medium">Made with ?? in India.</p>
        </div>
      </div>
    </div>
  ) },
];

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const ActiveComponent = SECTIONS.find(s => s.id === activeSection)?.component || Overview;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative z-50 w-64 h-full bg-card border-r border-border transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-6 flex items-center gap-3">
          <h1 className="font-bold text-xl tracking-tight">Analyz<span className="text-primary-gradient">AI</span></h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/10 text-primary border-glow' 
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
                data-testid={`nav-${section.id}`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : ''} />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-border flex items-center px-4 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-40">
          <button 
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </button>
          <div className="ml-auto flex items-center gap-4">
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <ActiveComponent />
          </div>
        </div>
      </main>
      
      {/* Mobile overlay */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
