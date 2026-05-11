export type SocialProofQuizId = "media-talent" | "parent-child-edu" | "partner-loyalty";

/** First calendar day included in the running total (local date). */
const ANCHOR_DAY = "2026-01-01";

const BASE_COUNT: Record<SocialProofQuizId, number> = {
  "media-talent": 13665,
  "parent-child-edu": 4822,
  "partner-loyalty": 8842,
};

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic pseudo-daily increment in [30, 100] for a quiz and calendar day. */
function dailyDelta(quizId: SocialProofQuizId, dayISO: string): number {
  const h = hash32(`${quizId}:${dayISO}`);
  return 30 + (h % 71);
}

export function localDayISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Cumulative display count: base plus sum of daily deltas from anchor through `now` (local midnight boundaries). */
export function getSocialProofFullReportCount(
  quizId: SocialProofQuizId,
  now: Date = new Date(),
): number {
  let total = BASE_COUNT[quizId];
  const end = localDayISO(now);

  if (end.localeCompare(ANCHOR_DAY) < 0) {
    return total;
  }

  let cursorMs = new Date(`${ANCHOR_DAY}T12:00:00`).getTime();
  const endMs = new Date(`${end}T12:00:00`).getTime();

  while (cursorMs <= endMs) {
    total += dailyDelta(quizId, localDayISO(new Date(cursorMs)));
    cursorMs += 86400000;
  }

  return total;
}
