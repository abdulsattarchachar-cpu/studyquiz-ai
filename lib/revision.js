// Spaced Repetition Tracker — Day-3 then Day-7 recall, fully automated.
// Stage 0: just added, next review at addedDate + 3 days.
// Stage 1: first review done, next review at that review date + 7 days.
// Stage 2: second review done — topic is "Mastered".

const TOPICS_KEY = "studyquiz_revision_topics";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function safeGet() {
  try {
    const raw = localStorage.getItem(TOPICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function safeSet(topics) {
  try {
    localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  } catch (e) {
    // ignore quota errors
  }
}

export function getAllTopics() {
  return safeGet();
}

export function addTopic({ subject, topic }) {
  const topics = safeGet();
  const today = todayStr();
  const newTopic = {
    id: Date.now() + Math.random(),
    subject: subject.trim(),
    topic: topic.trim(),
    addedDate: today,
    stage: 0,
    nextDue: addDays(today, 3),
  };
  topics.unshift(newTopic);
  safeSet(topics);
  return newTopic;
}

export function markDone(id) {
  const topics = safeGet();
  const today = todayStr();
  const updated = topics.map((t) => {
    if (t.id !== id) return t;
    if (t.stage === 0) {
      return { ...t, stage: 1, lastReviewed: today, nextDue: addDays(today, 7) };
    }
    if (t.stage === 1) {
      return { ...t, stage: 2, lastReviewed: today, nextDue: null };
    }
    return t;
  });
  safeSet(updated);
  return updated;
}

export function removeTopic(id) {
  const topics = safeGet().filter((t) => t.id !== id);
  safeSet(topics);
  return topics;
}

// Due today = active (not mastered) topics whose nextDue is today or earlier (overdue included)
export function getDueToday() {
  const topics = safeGet();
  const today = todayStr();
  return topics
    .filter((t) => t.stage < 2 && t.nextDue && t.nextDue <= today)
    .sort((a, b) => a.nextDue.localeCompare(b.nextDue));
}

export function getDueTodayCount() {
  return getDueToday().length;
}

export function getUpcoming() {
  const topics = safeGet();
  const today = todayStr();
  return topics
    .filter((t) => t.stage < 2 && t.nextDue && t.nextDue > today)
    .sort((a, b) => a.nextDue.localeCompare(b.nextDue));
}

export function getMastered() {
  return safeGet().filter((t) => t.stage === 2);
}

export function getGroupedBySubject() {
  const topics = safeGet();
  const bySubject = {};
  topics.forEach((t) => {
    if (!bySubject[t.subject]) bySubject[t.subject] = [];
    bySubject[t.subject].push(t);
  });
  return bySubject;
}

export const STAGE_LABELS = {
  0: "Day-3 Pending",
  1: "Day-7 Pending",
  2: "Mastered",
};
