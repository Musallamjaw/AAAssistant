import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3"
      data-testid="typing-indicator"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="inline-flex gap-1 p-3 bg-white rounded-2xl rounded-tl-md shadow-sm">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: index * 0.16,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
