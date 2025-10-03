import { useEffect } from "react";

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
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6 h-screen flex flex-col max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Assistant
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Your intelligent companion, powered by advanced AI</p>
        </div>
        
        {/* Chat Container */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div id="deployment-db3907fd-d283-4eb4-b96b-0a777b753af5" className="w-full h-full"></div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Powered by Pickaxe AI • Secure & Private
          </p>
        </div>
      </div>
    </div>
  );
}
