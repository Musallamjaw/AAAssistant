# Overview

This is a full-stack chat application built with React, Express, and TypeScript designed for Abdullah Al Salem University (AASU) Registration Section. The application provides a real-time chat interface where students can interact with an AI chatbot that has comprehensive knowledge about AASU admission requirements, transfer policies, course prerequisites, and academic calendars. The system uses DeepSeek AI for intelligent, beautifully formatted responses with emojis, bullet points, and clear sections.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Problem:** Need a modern, responsive chat interface with smooth animations and accessibility
**Solution:** React-based SPA with shadcn/ui component library
- **Framework:** React 18 with TypeScript for type safety
- **Routing:** wouter for lightweight client-side routing
- **State Management:** TanStack Query (React Query) for server state management
- **UI Components:** shadcn/ui (Radix UI primitives) for accessible, customizable components
- **Styling:** Tailwind CSS with CSS variables for theming
- **Animations:** Framer Motion for smooth UI transitions
- **Build Tool:** Vite for fast development and optimized production builds

**Rationale:** This stack provides a modern developer experience with excellent TypeScript support while maintaining high performance and accessibility standards.

## Backend Architecture

**Problem:** Need a simple, scalable REST API for chat operations
**Solution:** Express.js server with TypeScript
- **Framework:** Express.js for HTTP server and routing
- **Language:** TypeScript with ESM modules
- **API Pattern:** RESTful endpoints for chat message CRUD operations
- **Development:** tsx for TypeScript execution in development
- **Production Build:** esbuild for fast, optimized server bundling

**Key Endpoints:**
- `GET /api/chat/messages?sessionId=<id>` - Retrieve chat messages for a session
- `POST /api/chat/messages` - Send a new chat message (includes conversation history)
- `DELETE /api/chat/messages?sessionId=<id>` - Clear messages for a specific session

**Conversation Context:**
- The system maintains conversation history for each session
- When sending a message to DeepSeek AI, the full conversation history is included
- This allows the AI to reference previous messages and maintain context across multiple interactions
- Sessions are managed via sessionId stored in browser localStorage

**Rationale:** Express provides a minimal, flexible foundation that's well-suited for REST APIs, while TypeScript ensures type safety across the full stack.

## Data Storage

**Problem:** Need persistent storage for chat messages and user data
**Solution:** PostgreSQL with Drizzle ORM, with in-memory fallback for development
- **Database:** PostgreSQL (via Neon serverless driver)
- **ORM:** Drizzle ORM with TypeScript-first schema definitions
- **Schema Location:** `shared/schema.ts` for type sharing between frontend and backend
- **Validation:** Drizzle-Zod for runtime schema validation
- **Development Storage:** In-memory storage implementation (MemStorage) as fallback

**Database Schema:**
- **users table:** id, username, password
- **chat_messages table:** id, sessionId, content, isUser (boolean), timestamp

**Rationale:** Drizzle provides excellent TypeScript support with minimal overhead, while the shared schema approach ensures type consistency across the stack. The in-memory storage allows development without database setup.

## Development Environment

**Problem:** Need smooth development experience with hot reload and error handling
**Solution:** Vite development server with custom middleware integration
- **Dev Server:** Vite with custom Express middleware integration
- **HMR:** Hot module replacement through Vite's middleware mode
- **Error Handling:** Custom error overlay plugin (@replit/vite-plugin-runtime-error-modal)
- **Replit Integration:** Cartographer and dev banner plugins for Replit environment

**Rationale:** Vite's middleware mode allows seamless integration with Express while maintaining fast HMR and development experience.

## Authentication & Authorization

**Problem:** User authentication system defined in schema but not yet implemented
**Current State:** User schema exists with username/password fields, but no authentication endpoints or middleware are currently implemented
**Future Implementation:** Will likely use session-based authentication with connect-pg-simple for PostgreSQL session storage (already included in dependencies)

# External Dependencies

## Third-Party Services

**DeepSeek AI API**
- **Purpose:** AI-powered chatbot responses for AASU students
- **Implementation:** Direct integration with DeepSeek API (https://api.deepseek.com)
- **Model:** deepseek-chat
- **API Key:** Stored in DEEPSEEK_API_KEY environment secret
- **Knowledge Base:** Comprehensive AASU information including:
  - All 3 colleges with complete program listings (Business, Computing, Engineering)
  - Admission requirements for 2025-2026 with competitive percentages
  - Transfer rules between colleges and programs
  - Complete course prerequisites for Digital Marketing (DMK) and Entrepreneurship & Innovation (ENI) majors
  - Academic calendars for 2025-2026 and 2026-2027
  - Important deadlines for registration, withdrawal, and exams
- **Response Formatting:** Configured to provide beautiful responses with emojis, bold text, bullet points, and clear sections
- **Course Display:** Each course shown on separate line with full name (e.g., "ENL101 (English for Academic Studies)")
- **Transfer Requirements:** Clear "choose ONE" formatting to show students need one course from each category, not all

## Database Services

**Neon Serverless PostgreSQL**
- **Driver:** @neondatabase/serverless
- **Configuration:** DATABASE_URL environment variable required
- **Connection:** Configured in drizzle.config.ts

## UI Component Libraries

**Radix UI Primitives**
- Comprehensive set of accessible, unstyled components
- Includes: Dialog, Dropdown, Tooltip, Toast, Select, and 20+ other primitives
- Provides foundation for shadcn/ui components

**Framer Motion**
- Animation library for React
- Used for chat message animations and typing indicators

## Development Tools

**Replit Plugins**
- @replit/vite-plugin-cartographer - Code mapping
- @replit/vite-plugin-dev-banner - Development environment banner
- @replit/vite-plugin-runtime-error-modal - Enhanced error display

## Build & Development Dependencies

- **Vite** - Frontend build tool and dev server
- **esbuild** - Backend bundler for production
- **TypeScript** - Type checking and compilation
- **Tailwind CSS** - Utility-first styling
- **PostCSS** - CSS processing with autoprefixer