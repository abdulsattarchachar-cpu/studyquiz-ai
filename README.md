# StudyQuiz AI

StudyFlow AI + QuizCraft ko combine kar ke bana hua ek app — study planner, AI notes summarizer, aur AI quiz generator, sab ek jagah. Sirf **Groq API** use hoti hai (free tier available).

## Features

- **Study Planner** — Tasks add/complete/delete karo, browser mein hi save hote hain (localStorage).
- **AI Notes Summarizer** — Lambe notes paste karo, Groq LLM se clean summary milegi.
- **Quiz Generator** — Koi bhi topic likho, Groq se multiple-choice quiz generate hoga jise aap turant attempt bhi kar sakte ho (score ke saath).

## Local Setup

1. Dependencies install karo:
   ```bash
   npm install
   ```

2. `.env.example` ko copy kar ke `.env.local` banao:
   ```bash
   cp .env.example .env.local
   ```

3. `.env.local` mein apni Groq API key daalo:
   ```
   GROQ_API_KEY=your_actual_key_here
   ```
   Free key yahan se milegi: https://console.groq.com/keys

4. Dev server chalao:
   ```bash
   npm run dev
   ```

5. Browser mein kholo: http://localhost:3000

## Deploy on Vercel (Free)

1. Is project ko apne GitHub repo mein push karo.
2. [vercel.com](https://vercel.com) pe GitHub se login karo.
3. "Add New Project" → apni repo import karo.
4. Environment Variables mein `GROQ_API_KEY` add karo (Settings → Environment Variables).
5. Deploy dabao — 1-2 minute mein live URL mil jayegi (`your-project.vercel.app`).

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Groq API (llama-3.3-70b-versatile) for summarization & quiz generation
- Browser localStorage for planner tasks (no database needed)

## Project Structure

```
app/
  page.js              → Dashboard
  planner/page.js       → Study Planner
  notes/page.js          → Notes Summarizer UI
  quiz/page.js            → Quiz Generator UI
  api/summarize/route.js  → Groq summarization endpoint
  api/quiz/route.js        → Groq quiz generation endpoint
lib/groq.js              → Shared Groq API helper
components/Navbar.js      → Top navigation
```
