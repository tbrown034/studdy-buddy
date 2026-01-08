# Studdy Buddy

AI-powered study companion and chat assistant built with Next.js and OpenAI.

## Features

### General Chat
Open-ended conversations with GPT-4o Mini for any topic or question.

### Study Mode
Personalized learning sessions for any topic:
- Choose your study topic
- Set your skill level (beginner to expert)
- Select session type (lesson, quiz, practice or review)
- Pick duration (10 to 60 minutes)
- Get tailored instruction based on your needs

### Coding Mode
Specialized coding sessions with latest tech stack:
- **Languages**: JavaScript, TypeScript, Python, SQL
- **Frameworks**: React 19.2, Next.js 16
- **Backend**: Supabase, PostgreSQL, Neon
- **Styling**: Tailwind CSS v4
- **Session Types**: Lesson, Debug, Build, Review
- **AI trained on 2025 documentation** for latest features
- Interactive code examples with syntax highlighting
- Copy-paste ready code snippets

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=sk-proj-your-key-here
   ```

5. Run development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Routes

- `/` - General chat interface
- `/studdy-buddy` - Study session interface (any topic)
- `/studdy-buddy-coding` - Coding session interface (web development)
- `/dashboard` - API usage and cost monitoring dashboard

## Security & Cost Control

This application includes comprehensive safeguards:
- Rate limiting (20 requests per minute)
- Token limits (1000 max per response)
- Context truncation (20 messages max)
- Request validation
- Usage logging with cost estimates

See `SECURITY.md` for detailed information.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- OpenAI API (GPT-4o Mini)
- Lucide React (icons)

## Project Rules

1. **API Safety**: All requests are validated, rate limited and monitored
2. **Writing Style**: No oxford commas
3. **UI Components**: Lucide icons only (no emojis)
4. **Development**: KISS principle

## Documentation

- `claude.md` - Full project documentation and status
- `SECURITY.md` - Security measures and cost analysis
- `.env.example` - Environment variable template

## Cost Estimates

With current safeguards:
- Single message: ~$0.0003
- Typical conversation: ~$0.001-0.003
- Development usage: ~$1-5/month

See `SECURITY.md` for detailed cost breakdown.

## License

MIT
# studdy-buddy

