import "./globals.css";
import "katex/dist/katex.min.css";
import Navbar from "../components/Navbar";
import ToastProvider from "../components/ToastProvider";

export const metadata = {
  title: "StudyQuiz AI",
  description: "Your AI-powered study companion — planner, notes, flashcards, quizzes, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Loaded at runtime by the browser, not at build time — falls back to system fonts if offline */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface text-ink-900">
        <ToastProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
