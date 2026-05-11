const STORAGE_KEY_PREFIX = "mia_turing_lab_paid_";
export const PAID_VALIDITY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function paidStorageKey(quizId: string) {
  return `${STORAGE_KEY_PREFIX}${quizId}`;
}

/** Read payload without TTL side effects (TTL checked by callers). */
function readPaidPayload(quizId: string): PaidStatus | null {
  if (typeof window === "undefined") return null;

  const key = paidStorageKey(quizId);
  const data = localStorage.getItem(key);
  if (!data) return null;

  try {
    return JSON.parse(data) as PaidStatus;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export interface PaidStatus {
  quizId: string;
  type: string;
  timestamp: number;
  testMode?: boolean; // true if accessed via test mode (no payment required)
}

export function savePaidStatus(quizId: string, type: string): void {
  if (typeof window === "undefined") return;

  const key = paidStorageKey(quizId);
  const status: PaidStatus = {
    quizId,
    type,
    timestamp: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(status));
}

// Save test mode access - grants 24-hour access without payment
export function saveTestAccess(quizId: string, type: string): void {
  if (typeof window === "undefined") return;

  const key = paidStorageKey(quizId);
  const status: PaidStatus = {
    quizId,
    type,
    timestamp: Date.now(),
    testMode: true,
  };
  localStorage.setItem(key, JSON.stringify(status));
}

export function getPaidStatus(quizId: string): PaidStatus | null {
  if (typeof window === "undefined") return null;

  const status = readPaidPayload(quizId);
  if (!status) return null;

  const elapsed = Date.now() - status.timestamp;
  const key = paidStorageKey(quizId);

  if (elapsed > PAID_VALIDITY_MS) {
    localStorage.removeItem(key);
    return null;
  }

  return status;
}

/** Milliseconds remaining for full-report access; null if none or expired. */
export function getPaidRemainingMs(quizId: string): number | null {
  if (typeof window === "undefined") return null;

  const status = readPaidPayload(quizId);
  if (!status) return null;

  const elapsed = Date.now() - status.timestamp;
  const key = paidStorageKey(quizId);

  if (elapsed > PAID_VALIDITY_MS) {
    localStorage.removeItem(key);
    return null;
  }

  return PAID_VALIDITY_MS - elapsed;
}