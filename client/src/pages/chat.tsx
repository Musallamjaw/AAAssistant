import { useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, MessageCircle } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="chat-gradient-bg text-white py-4 px-4 sm:px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">AI Assistant</h1>
              <p className="text-xs text-white/80 hidden sm:block">Powered by Pickaxe</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Content - Full Screen Pickaxe */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <motion.div 
          className="flex-1 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full w-full">
            <div id="deployment-db3907fd-d283-4eb4-b96b-0a777b753af5" className="h-full"></div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
