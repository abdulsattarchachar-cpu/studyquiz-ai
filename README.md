# StudyQuiz AI

Ek all-in-one AI study companion — planner, notes summarizer, flashcards, quiz generator, doubt solver, essay grader, aur weak-topics tracker, sab ek jagah. Sirf **Groq API** use hoti hai (free tier available).

## Features

1. **Study Planner** — Tasks add/complete/delete, browser mein hi save (localStorage).
2. **Study Plan Generator** — Subjects + deadline batao, AI ek day-wise plan bana ke seedha Planner mein add kr deta hai.
3. **AI Notes Summarizer** — Standard summary ya ELI5 (Explain Like I'm 5) mode, plus output language translation (English, Urdu, Roman Urdu, etc).
4. **Flashcard Generator** — Topic se flip-to-reveal flashcards, jo aage Quiz mein convert ho sakte hain.
5. **Quiz Generator** — Kisi bhi topic pe MCQ quiz, turant attempt karo, score milega.
6. **Flashcard → Quiz Converter** — Apne flashcards se hi ek quiz generate karo.
7. **Weak Topics Tracker** — Quiz mein jo galat hue unka pattern track hota hai, aur unhi pe targeted practice questions generate ho sakte hain.
8. **Essay / Assignment Grader** — Apni writing paste karo, score + strengths + improvements + grammar notes milein.
9. **Doubt Solver (Chat)** — Koi bhi study sawal poochho, chat-style AI turant explain kare.
10. **Daily Study Tip** — Dashboard pe har din ek fresh AI-generated study tip.

## Local Setup

```bash
npm install
cp .env.example .env.local
```

`.env.local` mein apni Groq API key daalo:
```
GROQ_API_KEY=your_actual_key_here
```
Free key: https://console.groq.com/keys

```bash
npm run dev
```

Browser mein kholo: http://localhost:3000

## Deploy on Vercel (Free)

1. Repo ko GitHub pe push karo.
2. [vercel.com](https://vercel.com) pe GitHub se login karo.
3. "Add New Project" → apni repo import karo.
4. Framework Preset: **Next.js** select karo (agar auto-detect na ho).
5. Environment Variables mein `GROQ_API_KEY` add karo.
6. Deploy dabao — 1-2 minute mein live URL mil jayegi.

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Groq API (llama-3.3-70b-versatile) — summarization, quiz generation, flashcards, study plans, chat, essay grading, daily tips
- Browser localStorage — planner tasks, weak topics, daily tip cache (no database needed)

## Project Structure

```
app/
  page.js                       → Dashboard (with daily tip)
  planner/page.js                → Study Planner
  study-plan/page.js              → Study Plan Generator
  notes/page.js                    → Notes Summarizer (+ ELI5 + translation)
  flashcards/page.js                → Flashcard Generator (+ convert to quiz)
  quiz/page.js                       → Quiz Generator (+ context from flashcards/weak topics)
  weak-topics/page.js                 → Weak Topics Tracker
  essay-grader/page.js                 → Essay / Assignment Grader
  chat/page.js                          → Doubt Solver
  api/summarize/route.js                 → Groq summarization endpoint
  api/quiz/route.js                       → Groq quiz generation endpoint
  api/flashcards/route.js                  → Groq flashcard generation endpoint
  api/study-plan/route.js                   → Groq study plan generation endpoint
  api/grade/route.js                         → Groq essay grading endpoint
  api/chat/route.js                           → Groq multi-turn chat endpoint
  api/tip/route.js                             → Groq daily tip endpoint
lib/groq.js                                    → Shared Groq API helper
components/Navbar.js                            → Top navigation
components/DailyTip.js                           → Dashboard daily tip widget
```
