# StudyQuiz AI

An AI-powered study companion built with Next.js. It includes study planning, quizzes, flashcards, summaries, essay grading, a chat doubt solver, a structured learning mode, visual notes, and an AI math tutor with image input.

## Run locally

1. Install Node.js (LTS).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` (Windows PowerShell: `Copy-Item .env.example .env.local`).
4. Add your own API key to `.env.local`:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_new_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   ```
   Create a Gemini key at https://aistudio.google.com/apikey.
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000.

## AI providers

Set `AI_PROVIDER` to `gemini` (default), `groq`, `ollama`, or `openai`. Gemini supports both text generation and the Math Tutor's image-question mode. API keys must remain server-side in `.env.local`; never prefix them with `NEXT_PUBLIC_` or commit them to Git.

## Deploying

Add `AI_PROVIDER`, `GEMINI_API_KEY`, and (optionally) `GEMINI_MODEL` as environment variables in your hosting provider's project settings. Do not upload `.env.local` or paste API keys into client-side code.
