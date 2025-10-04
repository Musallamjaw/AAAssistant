import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { ChatMessage } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import chatLogo from "@assets/image_1759589515542.png";

interface ChatMessageProps {
  message: ChatMessage;
  delay?: number;
}

export default function ChatMessageComponent({ message, delay = 0 }: ChatMessageProps) {
  const isUser = message.isUser;
  const timeAgo = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });

  // Use Pickaxe response if available, otherwise use DeepSeek content
  const displayContent = !isUser && message.pickaxeResponse 
    ? message.pickaxeResponse 
    : message.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}
      data-testid={`message-${message.id}`}
    >
      {!isUser && (
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
          <img src={chatLogo} alt="AI Assistant" className="w-full h-full object-contain" />
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
          {isUser ? (
            <p className="text-sm sm:text-base text-white whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="text-sm sm:text-base text-foreground markdown-content">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
                  strong: ({children}) => <strong className="font-bold text-blue-600">{children}</strong>,
                  ul: ({children}) => <ul className="space-y-1.5 my-2">{children}</ul>,
                  ol: ({children}) => <ol className="space-y-1.5 my-2 list-decimal list-inside">{children}</ol>,
                  li: ({children}) => <li className="leading-relaxed">{children}</li>,
                  h1: ({children}) => <h1 className="text-xl font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
                  h2: ({children}) => <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                  h3: ({children}) => <h3 className="text-base font-bold mb-2 mt-2 first:mt-0">{children}</h3>,
                  hr: () => <hr className="my-3 border-gray-200" />,
                }}
              >
                {displayContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <span className={`text-xs text-muted-foreground mt-1 block ${isUser ? 'mr-1' : 'ml-1'}`}>
          {timeAgo}
        </span>
      </div>
      
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
}
