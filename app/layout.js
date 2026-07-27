import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "StudyQuiz AI",
  description: "Study planner, AI notes summarizer, and quiz generator — powered by Groq",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-800">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
