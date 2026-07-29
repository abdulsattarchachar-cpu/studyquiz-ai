// Lightweight client-side stats tracking, backed entirely by localStorage.
// No backend/database — everything is derived from what the user actually does in the browser.

const ACTIVITY_KEY = "studyquiz_activity_dates";
const QUIZ_HISTORY_KEY = "studyquiz_quiz_history";
const FLASHCARD_COUNT_KEY = "studyquiz_flashcard_count";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore quota errors
  }
}

// Call this on any meaningful user action (visiting dashboard, generating a quiz, etc.)
export function recordActivity() {
  const dates = safeGet(ACTIVITY_KEY) || [];
  const today = todayStr();
  if (!dates.includes(today)) {
    dates.push(today);
    safeSet(ACTIVITY_KEY, dates);
  }
}

export function getStreak() {
  const dates = new Set(safeGet(ACTIVITY_KEY) || []);
  let streak = 0;
  let cursor = new Date();
  // Count backwards from today while consecutive days exist
  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (dates.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getActivityLast7Days() {
  const dates = safeGet(ACTIVITY_KEY) || [];
  const dateSet = new Set(dates);
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    result.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      active: dateSet.has(key) ? 1 : 0,
    });
  }
  return result;
}

export function recordQuizAttempt({ topic, score, total }) {
  const history = safeGet(QUIZ_HISTORY_KEY) || [];
  history.push({ date: todayStr(), topic, score, total });
  safeSet(QUIZ_HISTORY_KEY, history.slice(-30)); // keep last 30
  recordActivity();
}

export function getQuizHistory() {
  return safeGet(QUIZ_HISTORY_KEY) || [];
}

export function getQuizStats() {
  const history = getQuizHistory();
  const quizzesTaken = history.length;
  const avgAccuracy = quizzesTaken
    ? Math.round(
        (history.reduce((sum, h) => sum + h.score / h.total, 0) / quizzesTaken) * 100
      )
    : 0;
  return { quizzesTaken, avgAccuracy };
}

export function incrementFlashcardCount(by = 1) {
  const count = safeGet(FLASHCARD_COUNT_KEY) || 0;
  safeSet(FLASHCARD_COUNT_KEY, count + by);
  recordActivity();
}

export function getFlashcardCount() {
  return safeGet(FLASHCARD_COUNT_KEY) || 0;
}

export function getTasksSummary() {
  const tasks = safeGet("studyquiz_tasks") || [];
  const completed = tasks.filter((t) => t.done).length;
  return { total: tasks.length, completed };
}
