# StudyQuiz AI

Ek all-in-one AI study companion — premium SaaS-style UI (Linear/Notion/Stripe inspired), planner, notes summarizer, flashcards, quiz generator, doubt solver, essay grader, weak-topics tracker, **AI Math Tutor**, **AI Roadmap Generator**, aur **AI Learning Mode (AI Teacher)** — sab ek jagah.

Ye app **dono** Groq (cloud, free) aur **Ollama (local, fully offline)** ke saath chal sakta hai — bas ek environment variable switch karni hai.

## ✨ Flagship Features

1. **AI Math Tutor** — equation type karo (scientific symbol toolbar: fraction, √, ∫, Σ, matrix, limits, etc. — KaTeX se live render hota hai) ya photo upload karo. AI chapter identify karta hai, formula batata hai, step-by-step solve karta hai (har step pe "Why?" button), common mistakes, practice question, real-life example. 4 modes: ELI10, Beginner, Intermediate, Expert.
2. **AI Roadmap Generator** — "I want to learn Java" jaisa goal likho, AI day-by-day/week-by-week roadmap banata hai (resources ke saath), Planner mein add ho sakta hai, seedha Quiz se test kr sakte ho.
3. **AI Learning Mode (AI Teacher)** — "Teach me Integration" likho. Chatbot nahi hai — poora structured lesson: Introduction → Prerequisites → Concept → Example → Practice (feedback ke saath) → Quiz → Weak Points → Revision Notes → Homework → Final Assessment.

## Core Features

4. **Study Planner** — priority/category ke saath tasks, localStorage mein save
5. **Study Plan Generator** — subjects + deadline se day-wise plan, seedha Planner mein add
6. **AI Notes Summarizer** — Standard/ELI5 mode + output language translation + copy/download
7. **Flashcard Generator** — flip-to-reveal cards, quiz mein convert
8. **Quiz Generator** — MCQ quiz, score tracking, confetti on completion
9. **Weak Topics Tracker** — missed questions automatically track, targeted practice
10. **Essay / Assignment Grader** — score + strengths + improvements + grammar, copy/download report
11. **Doubt Solver (Chat)** — typing indicator, suggested questions, code-block support
12. **Dashboard** — daily AI tip, quick stats (streak, tasks done, quizzes, flashcards), 7-day activity chart

Design system: Inter font, indigo (#4F6DF5) accent, 24px card radius, soft shadows, Lucide icons, Framer Motion animations (page fade transitions, hover lifts, confetti, animated progress timelines), WCAG AA focus states, fully responsive (mobile drawer nav).

## Not Included Yet (scope was too large for one pass)

Requested but need extra infrastructure — ask if you want them built next:
- **PDF Learning pipeline** (needs a PDF text-extraction library)
- **Interview Mode**
- **Coding Playground "Run Code"** (needs a third-party code execution API like Piston — safe code execution can't run inside this app directly)
- **Mind Map Generator**, **AI Notes Cleaner**, **AI Daily Challenge**

---

## Option A: Run with Groq (Cloud, Free Tier)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env file:
   ```bash
   cp .env.example .env.local
   ```
3. In `.env.local`, keep the default and add your key:
   ```
   AI_PROVIDER=groq
   GROQ_API_KEY=your_actual_key_here
   ```
   Free key: https://console.groq.com/keys
4. Run:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

---

## Option B: Run with Ollama (Fully Local, No API Key, No Internet Needed)

### Step 1 — Install Ollama
Download from https://ollama.com/download (Windows/Mac/Linux available).

### Step 2 — Pull a model
Open a terminal and run:
```bash
ollama pull llama3.1
```
(Other good options: `mistral`, `qwen2.5`, `phi3` — pick whichever fits your machine's RAM.)

### Step 3 — Make sure Ollama is running
Ollama usually auto-starts as a background service after install. To confirm, run:
```bash
ollama list
```
If that works, the server is up at `http://localhost:11434`.

### Step 4 — Configure the app
```bash
npm install
cp .env.example .env.local
```
Edit `.env.local`:
```
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```
(`GROQ_API_KEY` can stay blank — it's ignored when `AI_PROVIDER=ollama`.)

### Step 5 — Run the app
```bash
npm run dev
```
Open http://localhost:3000 — every AI feature (summarizer, quiz, flashcards, chat, essay grader, study plan, daily tip) now runs fully on your own machine.

**Note:** Local models (especially smaller ones like `phi3`) may occasionally return slightly less clean JSON for structured features (quiz/flashcards). If you see a "wasn't valid JSON" error, just click Generate again, or switch to a stronger model like `llama3.1:8b` or `qwen2.5:14b` if your machine can handle it.

---

## AI Math Tutor — Photo Upload (Vision Models)

The "upload a photo" mode needs a vision-capable model. Defaults are set but availability changes over time:

- **Groq:** defaults to `llama-3.2-90b-vision-preview`. Override with `GROQ_VISION_MODEL` in `.env.local` if that model is retired — check https://console.groq.com/docs/models for current vision models.
- **Ollama:** defaults to `llava`. Pull it first: `ollama pull llava`. Override with `OLLAMA_VISION_MODEL` if you prefer another vision model (e.g. `llama3.2-vision`, if you've pulled it).

If photo-solving fails, the typed-equation mode (with the built-in symbol toolbar) always works regardless of vision model availability.

## Deploy on Vercel (Groq mode only — Ollama needs a machine Vercel can't reach)

1. Push this repo to GitHub.
2. Import it on [vercel.com](https://vercel.com).
3. Framework Preset: **Next.js**.
4. Environment Variables: add `AI_PROVIDER=groq` and `GROQ_API_KEY`.
5. Deploy.

(Ollama only works for local/self-hosted use since it needs the Ollama server running on the same machine as the Next.js server.)

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS (custom design tokens: colors, radius, shadows, spacing)
- Lucide React (icons)
- Framer Motion (animations)
- Recharts (dashboard activity chart)
- Groq API or Ollama — pluggable via `lib/groq.js`
- Browser localStorage — planner tasks, weak topics, quiz history, stats (no database needed)

## Project Structure

```
app/
  page.js                       → Dashboard (stats, chart, feature grid)
  planner/page.js                → Study Planner
  study-plan/page.js              → Study Plan Generator
  notes/page.js                    → Notes Summarizer (+ ELI5 + translation)
  flashcards/page.js                → Flashcard Generator (+ convert to quiz)
  quiz/page.js                       → Quiz Generator (+ confetti, stats tracking)
  weak-topics/page.js                 → Weak Topics Tracker
  essay-grader/page.js                 → Essay / Assignment Grader
  chat/page.js                          → Doubt Solver
  api/*/route.js                         → API routes (all use lib/groq.js's callGroq)
lib/
  groq.js                                → AI provider switch (Groq / Ollama)
  stats.js                                → localStorage-based stats/activity tracking
components/
  Navbar.js, FeatureCard.js, StatCard.js, DailyTip.js, ToastProvider.js, Confetti.js
```
