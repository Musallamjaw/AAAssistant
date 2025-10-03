import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

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
      
      // TODO: Integrate with Pickaxe API here
      // For now, create a simple bot response
      if (messageData.isUser) {
        setTimeout(async () => {
          await storage.createChatMessage({
            content: "Thank you for your message! I'm currently in demo mode. Once connected to Pickaxe API, I'll provide intelligent responses based on your input.",
            isUser: false,
          });
        }, 2000);
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

  const httpServer = createServer(app);
  return httpServer;
}
