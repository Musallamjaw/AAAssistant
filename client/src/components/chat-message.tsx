import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { ChatMessage } from "@shared/schema";

interface ChatMessageProps {
  message: ChatMessage;
  delay?: number;
}

export default function ChatMessageComponent({ message, delay = 0 }: ChatMessageProps) {
  const isUser = message.isUser;
  const timeAgo = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}
      data-testid={`message-${message.id}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`flex-1 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div 
          className={`${
            isUser 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-md' 
              : 'bg-white rounded-2xl rounded-tl-md'
          } shadow-sm px-4 py-3 max-w-md sm:max-w-lg`}
        >
          <p className={`text-sm sm:text-base ${isUser ? 'text-white' : 'text-foreground'}`}>
            {message.content}
          </p>
          
          {/* Handle lists in bot messages */}
          {!isUser && message.content.includes('•') && (
            <div className="mt-2 space-y-1 text-sm sm:text-base">
              {message.content.split('\n').filter(line => line.includes('•')).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                  <span>{item.replace('• ', '').trim()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <span className={`text-xs text-muted-foreground mt-1 block ${isUser ? 'mr-1' : 'ml-1'}`}>
          {timeAgo}
        </span>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  );
}
