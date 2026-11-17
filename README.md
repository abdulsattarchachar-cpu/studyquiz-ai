# StudyQuiz AI

StudyQuiz AI is a Next.js learning assistant for quizzes, flashcards, study planning, notes, chat, summaries, essay grading, and math tutoring.

## AI provider

This project uses **Google Gemini only**. Groq, OpenAI, and local AI/Ollama integrations have been removed. All AI requests are sent through server-side API routes to Gemini; the API key is never exposed to browser code.

### Environment variables

Create `.env.local` for local development:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

For Vercel, add the same variables in **Project → Settings → Environment Variables** for Production (and Preview/Development if needed), then redeploy.

Get or manage a Gemini API key at https://aistudio.google.com/apikey.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy

Connect the GitHub repository to Vercel. Every push to the configured production branch can trigger a deployment. Ensure `GEMINI_API_KEY` and `GEMINI_MODEL` are configured in Vercel before deploying.

## Security

- Never commit `.env.local`.
- Never prefix `GEMINI_API_KEY` with `NEXT_PUBLIC_`.
- If an API key was exposed in a chat, repository, screenshot, or public deployment, revoke it and create a new one.
