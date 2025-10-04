import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, Send, Paperclip, Shield, MoreVertical, MessageCircle, Calendar, FileText, AlertTriangle, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { ChatMessage } from "@shared/schema";
import ChatMessageComponent from "@/components/chat-message";
import TypingIndicator from "@/components/typing-indicator";
import { nanoid } from "nanoid";

// Helper function to get or create session ID
function getSessionId(): string {
  const stored = localStorage.getItem("chatSessionId");
  if (stored) return stored;
  
  const newSessionId = nanoid();
  localStorage.setItem("chatSessionId", newSessionId);
  return newSessionId;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(getSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/chat/messages", {
        sessionId,
        content,
        isUser: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", sessionId] });
      setIsTyping(true);
      
      // Poll for bot response every 2 seconds for up to 30 seconds
      let pollCount = 0;
      const maxPolls = 15; // 15 * 2 seconds = 30 seconds max wait
      const pollInterval = setInterval(() => {
        pollCount++;
        queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", sessionId] });
        
        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setIsTyping(false);
        }
        
        // Check if we got a bot response
        const currentMessages = queryClient.getQueryData<ChatMessage[]>(["/api/chat/messages", sessionId]);
        if (currentMessages && currentMessages.length > 0) {
          const lastMessage = currentMessages[currentMessages.length - 1];
          if (!lastMessage.isUser) {
            clearInterval(pollInterval);
            setIsTyping(false);
          }
        }
      }, 2000);
    },
  });

  const clearMessagesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/chat/messages?sessionId=${sessionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/chat/messages", sessionId], []);
      setIsTyping(false);
      setMessage("");
    },
  });

  const startNewChatMutation = useMutation({
    mutationFn: async () => {
      // Create a new session ID
      const newSessionId = nanoid();
      localStorage.setItem("chatSessionId", newSessionId);
      setSessionId(newSessionId);
      return newSessionId;
    },
    onSuccess: (newSessionId) => {
      // Clear the old query cache for the previous session
      queryClient.setQueryData(["/api/chat/messages", newSessionId], []);
      setIsTyping(false);
      setMessage("");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    const messageToSend = message.trim();
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    
    await sendMessageMutation.mutateAsync(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-expand textarea
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
  };

  const suggestions = [
    { icon: Calendar, text: "Academic Calender", color: "text-yellow-500" },
    { icon: FileText, text: "Transfer Regulation", color: "text-blue-500" },
    { icon: AlertTriangle, text: "Warning Policy", color: "text-purple-500" },
  ];

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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => startNewChatMutation.mutate()}
              disabled={startNewChatMutation.isPending}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="new-chat-button"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white"
              data-testid="menu-button"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Chat Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Welcome Section */}
          {messages.length === 0 && !isLoading && (
            <motion.div 
              className="mb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome to AI Assistant</h2>
              <p className="text-muted-foreground text-sm sm:text-base">Ask me anything, I'm here to help you 24/7</p>
            </motion.div>
          )}

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth space-y-4 mb-6">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <ChatMessageComponent
                  key={msg.id}
                  message={msg}
                  delay={index * 0.1}
                />
              ))}
            </AnimatePresence>
            
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 0 && !isLoading && (
            <motion.div 
              className="mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-xs text-muted-foreground mb-2 px-1">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="px-4 py-2 bg-white hover:bg-gray-50 text-foreground text-sm rounded-full border border-border transition-all hover:shadow-md hover:scale-105"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    data-testid={`suggestion-${index}`}
                  >
                    <suggestion.icon className={`w-4 h-4 mr-2 ${suggestion.color}`} />
                    {suggestion.text}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Message Input Area */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-border p-3 sm:p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-ring p-2 rounded-lg"
                  data-testid="message-input"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 text-muted-foreground rounded-xl transition-all hover:scale-105"
                  data-testid="attach-button"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="send-button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground px-2">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-500" />
                Your data is secure
              </span>
              <span className="hidden sm:inline">Press Enter to send</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Powered by AI • <a href="#" className="text-secondary hover:underline">Privacy Policy</a> • <a href="#" className="text-secondary hover:underline">Terms of Service</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
