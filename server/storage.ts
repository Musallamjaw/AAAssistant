import { type User, type InsertUser, type ChatMessage, type InsertChatMessage, type PickaxeJob, type InsertPickaxeJob } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getChatMessages(): Promise<ChatMessage[]>;
  getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateChatMessagePickaxeResponse(id: string, response: string): Promise<void>;
  clearChatMessages(): Promise<void>;
  clearSessionMessages(sessionId: string): Promise<void>;
  createPickaxeJob(job: InsertPickaxeJob): Promise<PickaxeJob>;
  getPendingPickaxeJobs(): Promise<PickaxeJob[]>;
  updatePickaxeJobResponse(id: string, response: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private chatMessages: Map<string, ChatMessage>;
  private pickaxeJobs: Map<string, PickaxeJob>;

  constructor() {
    this.users = new Map();
    this.chatMessages = new Map();
    this.pickaxeJobs = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      id,
      sessionId: insertMessage.sessionId ?? randomUUID(),
      content: insertMessage.content,
      isUser: insertMessage.isUser ?? false,
      pickaxeResponse: null,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async updateChatMessagePickaxeResponse(id: string, response: string): Promise<void> {
    const message = this.chatMessages.get(id);
    if (message) {
      message.pickaxeResponse = response;
      this.chatMessages.set(id, message);
    }
  }

  async clearChatMessages(): Promise<void> {
    this.chatMessages.clear();
  }

  async clearSessionMessages(sessionId: string): Promise<void> {
    const messagesToDelete = Array.from(this.chatMessages.entries())
      .filter(([_, msg]) => msg.sessionId === sessionId)
      .map(([id, _]) => id);
    
    messagesToDelete.forEach(id => this.chatMessages.delete(id));
  }

  async createPickaxeJob(insertJob: InsertPickaxeJob): Promise<PickaxeJob> {
    const id = randomUUID();
    const job: PickaxeJob = {
      id,
      messageId: insertJob.messageId,
      question: insertJob.question,
      response: null,
      status: "pending",
      createdAt: new Date(),
    };
    this.pickaxeJobs.set(id, job);
    return job;
  }

  async getPendingPickaxeJobs(): Promise<PickaxeJob[]> {
    return Array.from(this.pickaxeJobs.values())
      .filter(job => job.status === "pending")
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async updatePickaxeJobResponse(id: string, response: string): Promise<void> {
    const job = this.pickaxeJobs.get(id);
    if (job) {
      job.response = response;
      job.status = "completed";
      this.pickaxeJobs.set(id, job);
    }
  }
}

export const storage = new MemStorage();
