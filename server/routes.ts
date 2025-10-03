import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

// Initialize OpenAI client with OpenRouter if API key is available
let openaiClient: OpenAI | null = null;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (OPENAI_API_KEY) {
  try {
    openaiClient = new OpenAI({ 
      apiKey: OPENAI_API_KEY,
      baseURL: "https://openrouter.ai/api/v1"
    });
    console.log("OpenAI client initialized successfully with OpenRouter");
  } catch (error) {
    console.error("Failed to initialize OpenAI client:", error);
  }
} else {
  console.log("OpenAI not configured - OPENAI_API_KEY not set");
}

// Track chat session to prevent stale bot responses after clear
let currentChatSession = 0;

async function getBotResponse(userMessage: string): Promise<string> {
  if (!openaiClient) {
    return "I'm currently in demo mode. Please configure the OPENAI_API_KEY environment variable to enable AI responses.";
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: "openai/chatgpt-4o-latest",
      messages: [
        {
          role: "system",
          content: "You are a helpful and friendly AI assistant. Provide clear, concise, and helpful responses to user questions."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 2048,
    });

    return response.choices[0].message.content || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I'm having trouble connecting to my AI service right now. Please try again in a moment.";
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all chat messages
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a new chat message
  app.post("/api/chat/messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      
      // Get bot response using OpenAI
      if (messageData.isUser) {
        // Capture the current session ID to check later
        const sessionAtRequest = currentChatSession;
        
        // Get bot response asynchronously
        getBotResponse(messageData.content).then(async (botResponse) => {
          // Only store bot response if chat hasn't been cleared since request
          if (sessionAtRequest === currentChatSession) {
            await storage.createChatMessage({
              content: botResponse,
              isUser: false,
            });
          }
        }).catch((error) => {
          console.error("Failed to get bot response:", error);
        });
      }
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid message format", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create message" });
      }
    }
  });

  // Clear all chat messages
  app.delete("/api/chat/messages", async (req, res) => {
    try {
      await storage.clearChatMessages();
      // Increment session to invalidate any pending bot responses
      currentChatSession++;
      res.json({ success: true, message: "All messages cleared" });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
