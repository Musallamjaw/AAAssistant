import { useEffect } from "react";
import { Bot } from "lucide-react";

export default function Chat() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://studio.pickaxe.co/api/embed/bundle.js';
    script.defer = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="chat-gradient-bg text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Assistant</h1>
              <p className="text-xs text-white/80">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Chat Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 w-full h-full">
          <div id="deployment-db3907fd-d283-4eb4-b96b-0a777b753af5" className="w-full h-full"></div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-3 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Powered by AI • <a href="#" className="text-secondary hover:underline">Privacy Policy</a> • <a href="#" className="text-secondary hover:underline">Terms of Service</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
