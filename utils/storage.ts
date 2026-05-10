const STORAGE_KEY_PREFIX = "mia_turing_lab_paid_";
const VALIDITY_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface PaidStatus {
  quizId: string;
  type: string;
  timestamp: number;
  testMode?: boolean; // true if accessed via test mode (no payment required)
}

export function savePaidStatus(quizId: string, type: string): void {
  if (typeof window === "undefined") return;

  const key = `${STORAGE_KEY_PREFIX}${quizId}`;
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

  const key = `${STORAGE_KEY_PREFIX}${quizId}`;
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

  const key = `${STORAGE_KEY_PREFIX}${quizId}`;
  const data = localStorage.getItem(key);

  if (!data) return null;

  try {
    const status: PaidStatus = JSON.parse(data);

    const now = Date.now();
    const elapsed = now - status.timestamp;

    if (elapsed > VALIDITY_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return status;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}