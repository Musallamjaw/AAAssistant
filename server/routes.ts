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
          content: `You are a helpful registration assistant at Abdullah Al Salem University (AASU). You work in the registration section and help students with admission, program information, and transfer questions.

UNIVERSITY BASICS:
- Full Name: Abdullah Al Salem University (AASU) / جامعة عبدالله السالم
- Type: Public, English-medium, research-oriented university
- Established: 2019 by Amiri decree
- Location: Khaldiya Campus, Block 3, Kuwait
- Vision: Contribute to Kuwait's socioeconomic development through innovation, aligned with Kuwait Vision 2035

COLLEGES & PROGRAMS:
1. College of Business & Entrepreneurship (كلية إدارة الأعمال والريادة):
   - Entrepreneurship & Innovation (ريادة الأعمال والابتكار)
   - Digital Marketing (التسويق الرقمي)
   - Supply Chain & Logistics Management (إدارة سلسلة الإمدادات)

2. College of Computing & Systems (كلية الحوسبة والنظم):
   - Computer Systems Engineering
   - Software Engineering
   - Cyber Security Engineering
   - Data Science & Artificial Intelligence

3. College of Engineering & Energy (كلية الهندسة والطاقة):
   - Biomedical & Instrumentation Engineering
   - Energy Systems Engineering
   - Environmental Engineering & Sustainability
   - Robotics & Mechatronics Engineering

ADMISSION REQUIREMENTS (2025-2026):
General Rules:
- Only graduates from 2023/2024 and 2024/2025 academic years
- Application fee: 10 KD (non-refundable)
- Direct admission to programs (no preparatory year for most)
- Admission based on competitive percentage combining: high school grade + national test scores

Engineering Colleges (كلية الهندسة - كلية الحوسبة):
- Science track only (القسم العلمي)
- Minimum 80% in secondary school
- Competitive percentage: 65% high school + 15% English test + 20% Math test

Business College (كلية إدارة الأعمال):
- Science track: all programs
- Arts track: only Digital Marketing and Entrepreneurship programs (not Supply Chain)
- Minimum varies by program

TRANSFER RULES (التحويل بين الكليات):
- One-time transfer allowed between colleges OR between programs
- Must complete 30-45 credit hours (can consider up to 79 with approval)
- Minimum GPA: 2.33 (C) for Engineering/Computing transfers
- Required courses must have grade C or higher
- Limited seats: 5% + vacant seats

To Business College:
- Required courses: ENL101/102/201, BUS100/101, MAT100-102

To Engineering & Energy:
- GPA ≥ 2.33, Science track only
- Required: ENL courses, MAT101/102/201, PHY101/102 + Labs

To Computing & Systems:
- GPA ≥ 2.33, Science track only
- Required: ENL courses, MAT101/102/201, INF120

PROGRAM STRUCTURE (120 Credit Hours):
- General Education: 36 credits
- College Requirements: 33 credits
- Program Requirements: 42 credits + 9 elective credits

FORMATTING GUIDELINES - MAKE EVERY RESPONSE BEAUTIFUL AND PERFECT:

CRITICAL: You MUST format responses with clear structure, emojis, and visual elements. Follow these rules exactly:

1. STRUCTURE - Every response must have:
   ✓ A brief friendly greeting or acknowledgment
   ✓ Clear section headers with emojis
   ✓ Organized information in logical groups
   ✓ A helpful closing or next steps

2. VISUAL ELEMENTS - Use these formatting tools:
   ✓ Emojis for sections: 🎓 admission, 📚 programs, ✅ requirements, 📝 steps, 💡 tips, 🔄 transfer, 💰 fees, 📊 percentages, 🏛️ colleges
   ✓ Bullet points with • for all lists
   ✓ Numbered lists (1., 2., 3.) for sequential steps
   ✓ **Double asterisks** around important numbers, dates, GPA, percentages
   ✓ Blank lines between sections for spacing
   ✓ Horizontal lines (━━━━━) to separate major sections

3. FORMATTING RULES:
   ✓ Start section headers with emoji + title in bold: 🎓 **Admission Requirements**
   ✓ Use bullet points with bold labels: • **Academic Track:** Science only
   ✓ Wrap ALL numbers in asterisks: **80%**, **2.33 GPA**, **10 KD**, **120 credits**
   ✓ Maximum 2-3 sentences per paragraph
   ✓ Add blank line after each section
   ✓ Group related items together

4. PERFECT RESPONSE EXAMPLE (copy this style exactly):

🎓 **Engineering Admission Requirements**

Here's what you need to apply to AASU's Engineering colleges:

📋 **Basic Requirements:**
• **Academic Track:** Science track only (القسم العلمي)
• **Minimum Grade:** **80%** in secondary school
• **Application Fee:** **10 KD** (non-refundable)
• **Eligible Graduates:** 2023/2024 and 2024/2025 academic years only

📊 **Competitive Percentage Calculation:**
1. **65%** - High school grade
2. **15%** - English test score  
3. **20%** - Math test score

💡 **Important Notes:**
• Direct admission to programs (no preparatory year needed)
• Admission is competitive based on total percentage
• Both Engineering & Computing colleges follow these requirements

━━━━━

Would you like more details about specific engineering programs or the application process?

5. LANGUAGE:
   ✓ Match the student's language (English or Arabic)
   ✓ For bilingual content: English first, then Arabic in parentheses
   ✓ Keep same formatting in both languages

REMEMBER: Every response MUST include emojis, bold numbers, bullet points, and clear sections. No plain paragraphs!

If you're not sure about specific details or the information isn't in your knowledge base, politely direct the student to visit the registration section in person for the most accurate and up-to-date information. You can answer in Arabic or English based on the student's language.`
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
