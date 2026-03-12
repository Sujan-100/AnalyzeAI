import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2 } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import { chatWithDocument } from "@/lib/api";

export default function Chatbot() {
  const { state, updateState } = useAppState();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.chatHistory, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, text: input };
    const currentHistory = [...state.chatHistory, userMessage];

    updateState({ chatHistory: currentHistory });
    setInput("");
    setIsTyping(true);

    try {
      const data = await chatWithDocument(userMessage.text);
      updateState({
        chatHistory: [...currentHistory, { role: "bot", text: data.response }],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Chat failed";
      updateState({
        chatHistory: [...currentHistory, { role: "bot", text: `Error: ${message}` }],
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col space-y-4">
      <div className="flex-shrink-0">
        <h2 className="text-3xl font-bold mb-2">Contextual Chatbot</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Responses are generated only from uploaded document context.</p>
          <button
            onClick={() => updateState({ chatHistory: [] })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
          >
            <Trash2 size={16} /> Clear Chat
          </button>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover-card-glow relative">
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6" ref={scrollRef}>
          {state.chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border-glow">
                <Bot size={40} className="text-primary" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">How can I help you today?</h3>
              <p>Ask me anything about your uploaded documents.</p>
            </div>
          ) : (
            <>
              {state.chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "bot" ? "bg-primary/20 text-primary border border-primary/50 border-glow shadow-[0_0_15px_hsl(var(--primary)/0.2)]" : "bg-muted border border-border text-muted-foreground"}`}>
                    {msg.role === "bot" ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className={`px-5 py-3.5 rounded-2xl max-w-[80%] shadow-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-background border border-border rounded-tl-sm text-foreground"}`}>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/20 text-primary border border-primary/50 border-glow">
                    <Bot size={20} />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-background border border-border rounded-tl-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 bg-background border-t border-border mt-auto">
          <form onSubmit={(e) => void handleSend(e)} className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your document..."
              className="w-full bg-card border border-border rounded-xl pl-4 pr-14 py-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-all hover:opacity-90"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
