# Studdy Buddy - Project Status & Rules

## Current Status

### Model Configuration
- **Model**: GPT-4o Mini (gpt-4o-mini)
- **Provider**: OpenAI
- **Stream**: Disabled (batch responses)

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
- Basic error handling

**Missing (HIGH PRIORITY)**:
- Rate limiting
- Request size limits
- Token counting
- Usage monitoring
- Cost caps
- IP-based throttling
- Authentication
- Request validation

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
│   ├── chat/route.ts      # Chat API endpoint (PROTECTED)
│   └── dashboard/route.ts # Dashboard data endpoint
├── components/            # UI components
│   ├── loading-spinner.tsx
│   └── markdown-message.tsx
├── dashboard/page.tsx     # Usage monitoring dashboard
├── page.tsx               # General chat interface
├── studdy-buddy/
│   └── page.tsx           # Study session interface
├── studdy-buddy-coding/
│   └── page.tsx           # Coding session interface
├── layout.tsx             # Root layout
├── error.tsx              # Error boundary
├── loading.tsx            # Loading state
└── globals.css            # Styles

lib/
└── usage-tracker.ts       # In-memory usage tracking

.env.local                 # API key (GITIGNORED)
claude.md                  # This file
SECURITY.md                # Security documentation
```

## Features

### General Chat (/)
- Open-ended conversation
- No context or constraints
- General purpose AI assistant
- Rate limited and monitored

### Study Mode (/studdy-buddy)
- Structured learning sessions for any topic
- Topic-based conversations
- Configurable parameters:
  - Study topic and details
  - Skill level (beginner to expert)
  - Session type (lesson, quiz, practice, review)
  - Duration (10-60 minutes)
- Context-aware tutoring
- Personalized instruction
- All safeguards still apply

### Coding Mode (/studdy-buddy-coding)
- Specialized web development sessions
- AI trained on latest 2025 documentation
- Technology stack selection:
  - Languages: JavaScript, TypeScript, Python, SQL
  - Frameworks: React 19.2, Next.js 16, or none
  - Backend: Supabase, PostgreSQL, Neon, or none
  - Always includes Tailwind CSS v4
- Session types:
  - Lesson: Learn new coding concepts
  - Debug: Fix code issues and errors
  - Build: Create projects step-by-step
  - Review: Code review and best practices
- Features latest 2025 tech:
  - Next.js 16: Turbopack, React 19.2, Server Actions
  - React 19.2: Server Components, Actions API, use hook
  - TypeScript 5.9: Latest type features
  - Tailwind v4: CSS-first config, P3 colors
  - Supabase: AI features, Edge Functions
- Markdown with syntax highlighting
- Copy buttons on all code blocks
- All safeguards still apply

## Dependencies
- next: 16.0.0
- openai: latest
- lucide-react: latest
- react: 19.2.0
- tailwindcss: 4.x
- react-markdown: latest (markdown rendering)
- remark-gfm: latest (GitHub flavored markdown)
- rehype-highlight: latest (syntax highlighting)
- highlight.js: latest (code highlighting)
- @tailwindcss/typography: latest (prose styles)
