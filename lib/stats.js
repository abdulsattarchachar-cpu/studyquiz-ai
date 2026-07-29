// Lightweight client-side stats tracking, backed entirely by localStorage.
// No backend/database — everything shown on the dashboard is derived from what the user
// actually did in the browser (no fabricated numbers or fake trends).

const ACTIVITY_KEY = "studyquiz_activity_dates";
const QUIZ_HISTORY_KEY = "studyquiz_quiz_history";
const FLASHCARD_COUNT_KEY = "studyquiz_flashcard_count";
const AI_QUESTIONS_KEY = "studyquiz_ai_questions_asked";
const ACTIVITY_LOG_KEY = "studyquiz_activity_log";
const CONTINUE_LEARNING_KEY = "studyquiz_continue_learning";
const ACHIEVEMENTS_KEY = "studyquiz_achievements_unlocked";

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

// --- Daily activity / streak ---

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

// --- Quiz history / accuracy ---

export function recordQuizAttempt({ topic, score, total }) {
  const history = safeGet(QUIZ_HISTORY_KEY) || [];
  history.push({ date: todayStr(), topic, score, total });
  safeSet(QUIZ_HISTORY_KEY, history.slice(-50));
  recordActivity();
  logActivity("quiz", `Completed a quiz on "${topic}" — scored ${score}/${total}`);
}

export function getQuizHistory() {
  return safeGet(QUIZ_HISTORY_KEY) || [];
}

export function getQuizStats() {
  const history = getQuizHistory();
  const quizzesTaken = history.length;
  const avgAccuracy = quizzesTaken
    ? Math.round((history.reduce((sum, h) => sum + h.score / h.total, 0) / quizzesTaken) * 100)
    : 0;
  return { quizzesTaken, avgAccuracy };
}

// Accuracy trend: average accuracy per attempt, last 10 attempts (chronological)
export function getQuizAccuracyTrend() {
  const history = getQuizHistory().slice(-10);
  return history.map((h, i) => ({
    label: `#${i + 1}`,
    accuracy: Math.round((h.score / h.total) * 100),
  }));
}

// Group quiz attempts by topic to approximate "subject mastery" — real data, not fake subjects
export function getSubjectProgress(limit = 6) {
  const history = getQuizHistory();
  const byTopic = {};
  history.forEach((h) => {
    if (!byTopic[h.topic]) byTopic[h.topic] = { attempts: 0, scoreSum: 0, totalSum: 0 };
    byTopic[h.topic].attempts += 1;
    byTopic[h.topic].scoreSum += h.score;
    byTopic[h.topic].totalSum += h.total;
  });
  return Object.entries(byTopic)
    .map(([topic, v]) => ({
      topic,
      attempts: v.attempts,
      mastery: Math.round((v.scoreSum / v.totalSum) * 100),
    }))
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, limit);
}

// --- Flashcards ---

export function incrementFlashcardCount(by = 1) {
  const count = safeGet(FLASHCARD_COUNT_KEY) || 0;
  safeSet(FLASHCARD_COUNT_KEY, count + by);
  recordActivity();
}

export function getFlashcardCount() {
  return safeGet(FLASHCARD_COUNT_KEY) || 0;
}

// --- AI questions asked (Doubt Solver + AI Teacher practice submissions) ---

export function incrementAIQuestionsAsked(by = 1) {
  const count = safeGet(AI_QUESTIONS_KEY) || 0;
  safeSet(AI_QUESTIONS_KEY, count + by);
  recordActivity();
}

export function getAIQuestionsAsked() {
  return safeGet(AI_QUESTIONS_KEY) || 0;
}

// --- Planner tasks ---

export function getTasksSummary() {
  const tasks = safeGet("studyquiz_tasks") || [];
  const completed = tasks.filter((t) => t.done).length;
  return { total: tasks.length, completed };
}

export function getTodayTasks() {
  const tasks = safeGet("studyquiz_tasks") || [];
  const today = todayStr();
  return tasks.filter((t) => t.dueDate === today).sort((a, b) => (a.done ? 1 : -1));
}

// Upcoming "exams" — derived from Planner tasks tagged "Exam Prep" with future due dates,
// grouped by due date so multiple tasks for the same exam collapse into one countdown card.
export function getUpcomingExams(limit = 3) {
  const tasks = safeGet("studyquiz_tasks") || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const examTasks = tasks.filter(
    (t) => t.category === "Exam Prep" && t.dueDate && new Date(t.dueDate) >= today
  );

  const byDate = {};
  examTasks.forEach((t) => {
    if (!byDate[t.dueDate]) byDate[t.dueDate] = { dueDate: t.dueDate, total: 0, done: 0 };
    byDate[t.dueDate].total += 1;
    if (t.done) byDate[t.dueDate].done += 1;
  });

  return Object.values(byDate)
    .map((e) => {
      const due = new Date(e.dueDate);
      const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      return {
        ...e,
        daysLeft,
        prepPercent: e.total ? Math.round((e.done / e.total) * 100) : 0,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, limit);
}

// --- Recent activity log (generic event feed) ---

export function logActivity(type, label) {
  const log = safeGet(ACTIVITY_LOG_KEY) || [];
  log.unshift({ type, label, time: Date.now() });
  safeSet(ACTIVITY_LOG_KEY, log.slice(0, 20));
}

export function getRecentActivity(limit = 6) {
  const log = safeGet(ACTIVITY_LOG_KEY) || [];
  return log.slice(0, limit);
}

// --- Continue Learning (AI Learning Mode resume) ---

export function setContinueLearning({ topic, stageIndex, stageLabel, totalStages }) {
  safeSet(CONTINUE_LEARNING_KEY, { topic, stageIndex, stageLabel, totalStages, updatedAt: Date.now() });
}

export function getContinueLearning() {
  return safeGet(CONTINUE_LEARNING_KEY);
}

export function clearContinueLearning() {
  try {
    localStorage.removeItem(CONTINUE_LEARNING_KEY);
  } catch (e) {
    // ignore
  }
}

// --- Achievements (derived purely from real stats, no fake data) ---

const ACHIEVEMENT_DEFS = [
  { id: "streak3", label: "3-Day Streak", check: (s) => s.streak >= 3 },
  { id: "streak7", label: "7-Day Streak", check: (s) => s.streak >= 7 },
  { id: "quiz5", label: "5 Quizzes Taken", check: (s) => s.quizzesTaken >= 5 },
  { id: "quiz20", label: "20 Quizzes Taken", check: (s) => s.quizzesTaken >= 20 },
  { id: "flashcards20", label: "20 Flashcards Made", check: (s) => s.flashcards >= 20 },
  { id: "tasks10", label: "10 Tasks Completed", check: (s) => s.tasksCompleted >= 10 },
  { id: "accuracy80", label: "80%+ Quiz Accuracy", check: (s) => s.avgAccuracy >= 80 && s.quizzesTaken >= 3 },
];

export function getAchievements() {
  const { quizzesTaken, avgAccuracy } = getQuizStats();
  const { completed } = getTasksSummary();
  const snapshot = {
    streak: getStreak(),
    quizzesTaken,
    avgAccuracy,
    flashcards: getFlashcardCount(),
    tasksCompleted: completed,
  };

  const unlockedBefore = new Set(safeGet(ACHIEVEMENTS_KEY) || []);
  const unlockedNow = ACHIEVEMENT_DEFS.filter((a) => a.check(snapshot)).map((a) => a.id);
  const newlyUnlocked = unlockedNow.filter((id) => !unlockedBefore.has(id));

  safeSet(ACHIEVEMENTS_KEY, unlockedNow);

  // Simple XP/level system based on real actions taken
  const xp =
    snapshot.streak * 10 +
    snapshot.quizzesTaken * 15 +
    snapshot.flashcards * 2 +
    snapshot.tasksCompleted * 5;
  const level = Math.floor(xp / 100) + 1;

  return {
    all: ACHIEVEMENT_DEFS.map((a) => ({ id: a.id, label: a.label, unlocked: unlockedNow.includes(a.id) })),
    newlyUnlocked,
    xp,
    level,
    xpIntoLevel: xp % 100,
  };
}
