import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull().default(false),
  pickaxeResponse: text("pickaxe_response"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const pickaxeJobs = pgTable("pickaxe_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull(),
  question: text("question").notNull(),
  response: text("response"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  content: true,
  isUser: true,
});

export const insertPickaxeJobSchema = createInsertSchema(pickaxeJobs).pick({
  messageId: true,
  question: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type PickaxeJob = typeof pickaxeJobs.$inferSelect;
export type InsertPickaxeJob = z.infer<typeof insertPickaxeJobSchema>;
