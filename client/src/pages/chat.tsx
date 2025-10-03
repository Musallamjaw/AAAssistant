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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="chat-gradient-bg text-white py-6 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Assistant</h1>
              <p className="text-sm text-white/90">Powered by Pickaxe</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Pickaxe Embed */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <motion.div 
          className="w-full max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 min-h-[600px]">
            <div id="deployment-db3907fd-d283-4eb4-b96b-0a777b753af5"></div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur border-t border-gray-200 py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs sm:text-sm text-gray-600">
            Powered by Pickaxe AI • <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> • <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
