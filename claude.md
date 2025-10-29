# Studdy Buddy - Project Status & Rules

## Current Status

### Model Configuration
- **Model**: GPT-4o Mini (gpt-4o-mini)
- **Provider**: OpenAI
- **Stream**: Enabled (real-time streaming responses)

### Cost Analysis
**GPT-4o Mini Pricing** (as of January 2025):
- Input: $0.150 per 1M tokens (~$0.00015 per 1K tokens)
- Output: $0.600 per 1M tokens (~$0.0006 per 1K tokens)

**Estimated Costs per Conversation**:
- Average message: ~100-200 tokens
- 10 message conversation: ~$0.001-0.003
- 100 conversations: ~$0.10-0.30

**Monthly Risk Exposure**:
- No limits currently set
- Unlimited requests possible
- Potential for abuse if key leaked
- **CRITICAL**: No rate limiting implemented

### Current Protections
**Implemented**:
- API key in .env.local (gitignored)
- Server-side API route only
- Comprehensive error handling
- Rate limiting (20 requests per minute per IP)
- Request size limits (2000 chars per message)
- Token counting and usage tracking
- Context window management (max 20 messages)
- Request validation
- Streaming responses for better UX

**Missing (MEDIUM PRIORITY)**:
- Cost caps and alerts
- Authentication (public access currently)
- Database-backed usage tracking
- Request queue management

### Security Status
**Secure**:
- API key not exposed to client
- .env.local in .gitignore
- Server-side processing only

**Vulnerabilities**:
- No authentication (anyone can use)
- No rate limiting (DDoS vulnerable)
- No request validation
- No token limits per request
- Context grows unbounded
- No logging of usage

## Project Rules

### Rule 1: API Safety & Cost Control
We must implement proper safeguards:
- Maximum tokens per request
- Rate limiting per IP/session
- Context window management
- Usage tracking and alerts
- Cost estimation per request
- Automatic cutoffs at thresholds
- Never expose API keys
- Always validate requests

### Rule 2: Writing Style
No oxford commas in any text or documentation.

### Rule 3: UI Components
Use Lucide icons library only. Never use emojis in code or UI.

### Rule 4: Development Philosophy
KISS (Keep It Simple Stupid) - when in doubt choose the simpler solution.

## Immediate Action Items

### High Priority (Security & Cost)
1. Implement rate limiting (prevent abuse)
2. Add max tokens per request (prevent runaway costs)
3. Add context length limits (prevent bloat)
4. Create usage logging (track costs)
5. Add request validation (prevent malformed requests)

### Medium Priority
1. Add user sessions (track individual usage)
2. Implement cost dashboard (monitor spend)
3. Add request queue (manage load)
4. Create alert system (notify on thresholds)

### Low Priority
1. Add authentication (control access)
2. Implement caching (reduce costs)
3. Add analytics (usage patterns)

## Technical Details

### API Route Location
`/app/api/chat/route.ts`

### Current Request Flow
1. Client sends messages array
2. Server validates and rate limits
3. Context truncated to max messages
4. OpenAI API called with safeguards
5. Usage logged with cost estimates
6. Response returned with rate limit headers

### Context Management
- Automatic truncation to 20 messages max
- System messages preserved
- Recent conversation prioritized
- Costs bounded by max tokens

### File Structure
```
app/
├── api/
│   ├── chat/route.ts      # Chat API endpoint (streaming enabled)
│   └── dashboard/route.ts # Dashboard data endpoint
├── components/            # UI components
│   ├── wizard-flow.tsx    # Step-by-step wizard component
│   ├── loading-spinner.tsx
│   ├── markdown-message.tsx
│   └── header.tsx
├── hooks/
│   └── use-chat-stream.ts # Streaming chat hook
├── stats/page.tsx         # Usage monitoring dashboard
├── home/page.tsx          # Landing page
├── page.tsx               # General chat interface
├── study/page.tsx         # Study session with wizard
├── code/page.tsx          # Coding session with wizard
├── layout.tsx             # Root layout
├── error.tsx              # Error boundary
├── loading.tsx            # Loading state
└── globals.css            # Styles

lib/
├── usage-tracker.ts       # In-memory usage tracking
└── diagnostic-questions.json  # 90+ curated quiz questions for diagnostic fallback

.env.local                 # API key (GITIGNORED)
CLAUDE.md                  # This file (project documentation)
SECURITY.md                # Security documentation
```

## Features

### General Chat (/)
- Open-ended conversation
- No context or constraints
- General purpose AI assistant
- Rate limited and monitored

### Study Mode (/study)
- **Step-by-step wizard interface** for intuitive session setup
- Structured learning sessions for any topic
- Configurable parameters:
  - Study topic and details
  - Skill level (beginner to expert)
  - Session type (lesson, quiz, practice, review)
  - Duration (10-60 minutes)
- **Review step** showing session summary and AI instructions
- **Transparent prompt engineering** - users can see exactly how the AI is instructed
- Context-aware tutoring with streaming responses
- Personalized instruction based on skill level
- All safeguards still apply

### Coding Mode (/code)
- **Step-by-step wizard interface** optimized for coding sessions
- Specialized web development sessions
- AI trained on latest 2025 documentation
- Technology stack selection:
  - Languages: JavaScript, TypeScript, Python, React, LLM, General
  - Frameworks: React 19.2, Next.js 16, or none
  - Backend: Supabase, PostgreSQL, Neon, or none
  - Always includes Tailwind CSS v4
- **Skill Level Options:**
  - Beginner: Start with fundamentals
  - Intermediate: Build on existing knowledge
  - Advanced: Dive into complex topics
  - **Diagnostic Test**: Interactive 5-question assessment to determine your level
- **Diagnostic Test Features:**
  - Beautiful interactive quiz interface with clickable buttons
  - Visual progress tracking with animated progress bars
  - 5 carefully selected questions (2 easy, 2 medium, 1 hard)
  - Immediate feedback with explanations
  - Automatic level recommendation based on performance
  - **Automatic AI fallback**: Tries AI-generated questions first, falls back to 90+ curated questions on API failure
  - Zero cost when using fallback questions
  - Works offline with local question bank
- Session types:
  - Lesson: Learn new coding concepts
  - Practice: Work through coding exercises
  - Flashcards: Quiz on key concepts
  - Tests: Assess knowledge with questions
- Features latest 2025 tech:
  - Next.js 16: Turbopack, React 19.2, Server Actions
  - React 19.2: Server Components, Actions API, use hook
  - TypeScript 5.9: Latest type features
  - Tailwind v4: CSS-first config, P3 colors
  - Supabase: AI features, Edge Functions
- Markdown with syntax highlighting
- Copy buttons on all code blocks
- All safeguards still apply

## Recent UX Improvements (October 2025)

### Wizard Flow Interface
- **Multi-step configuration** replaces overwhelming single-page forms
- Visual progress bar with step indicators
- Back/forward navigation with smart validation
- Mobile-optimized responsive design
- Quick suggestions and popular topics
- Visual card selection for better UX

### Prompt Transparency
- **Review step** shows session summary before starting
- Users can view the exact AI instructions
- Toggle to show/hide system prompt
- Builds trust and educates users about prompt engineering
- Helps users understand how their choices affect AI behavior

### Performance Optimizations
- **Streaming responses** for instant perceived feedback
- Word-by-word text rendering like ChatGPT
- Reduced time-to-first-token perception
- Smooth animations and transitions
- Optimistic UI updates

### Benefits
- Less overwhelming for new users
- Better mobile experience
- Increased transparency
- Faster perceived performance
- Educational about AI prompt engineering
- More engaging step-by-step flow

## Dependencies
- next: 16.0.0
- openai: latest (with streaming support)
- lucide-react: latest
- react: 19.2.0
- tailwindcss: 4.x
- react-markdown: latest (markdown rendering)
- remark-gfm: latest (GitHub flavored markdown)
- rehype-highlight: latest (syntax highlighting)
- highlight.js: latest (code highlighting)
- @tailwindcss/typography: latest (prose styles)
