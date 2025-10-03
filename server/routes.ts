import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import { Client } from "@botpress/client";
import { nanoid } from "nanoid";

// Initialize Botpress client if API key is available
let botpressClient: Client | null = null;
const BOTPRESS_API_KEY = process.env.BOTPRESS_API_KEY;
const BOTPRESS_BOT_ID = process.env.BOTPRESS_BOT_ID;
const BOTPRESS_WORKSPACE_ID = process.env.BOTPRESS_WORKSPACE_ID;

if (BOTPRESS_API_KEY) {
  try {
    const clientConfig: any = { token: BOTPRESS_API_KEY };
    if (BOTPRESS_BOT_ID) {
      clientConfig.botId = BOTPRESS_BOT_ID;
    }
    if (BOTPRESS_WORKSPACE_ID) {
      clientConfig.workspaceId = BOTPRESS_WORKSPACE_ID;
    }
    botpressClient = new Client(clientConfig);
    console.log("Botpress client initialized successfully");
    if (!BOTPRESS_BOT_ID) {
      console.log("Warning: BOTPRESS_BOT_ID not set - some operations may be limited");
    }
    if (!BOTPRESS_WORKSPACE_ID) {
      console.log("Warning: BOTPRESS_WORKSPACE_ID not set - some operations may be limited");
    }
  } catch (error) {
    console.error("Failed to initialize Botpress client:", error);
  }
} else {
  console.log("Botpress not configured - BOTPRESS_API_KEY not set");
}

// Simple in-memory storage for conversation/user IDs per session
const sessionConversations = new Map<string, { conversationId: string; userId: string }>();

// Track chat session to prevent stale bot responses after clear
let currentChatSession = 0;

async function getBotResponse(userMessage: string, sessionId: string = 'default'): Promise<string> {
  if (!botpressClient) {
    return "I'm currently in demo mode. Please configure BOTPRESS_API_KEY and BOTPRESS_BOT_ID environment variables to enable AI responses.";
  }

  try {
    // Get or create conversation and user IDs for this session
    let session = sessionConversations.get(sessionId);
    
    if (!session) {
      // Create a new conversation and user
      const userId = `user-${nanoid()}`;
      
      const { user } = await botpressClient.getOrCreateUser({ tags: { id: userId } });
      const { conversation } = await botpressClient.getOrCreateConversation({
        channel: 'channel',
        tags: { id: `conv-${nanoid()}` },
      });

      session = {
        conversationId: conversation.id,
        userId: user.id,
      };
      sessionConversations.set(sessionId, session);
    }

    // Send user message to Botpress
    await botpressClient.createMessage({
      conversationId: session.conversationId,
      userId: session.userId,
      type: 'text',
      payload: {
        text: userMessage,
      },
      tags: {},
    });

    // Wait a moment for the bot to process and respond
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get the latest messages from the conversation
    const { messages } = await botpressClient.listMessages({
      conversationId: session.conversationId,
    });

    // Find the most recent bot message
    const botMessages = messages
      .filter(msg => msg.direction === 'outgoing' && msg.type === 'text')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (botMessages.length > 0 && botMessages[0].payload.text) {
      return botMessages[0].payload.text;
    }

    return "I received your message but couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Botpress API error:", error);
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
      
      // Get bot response using Botpress
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
