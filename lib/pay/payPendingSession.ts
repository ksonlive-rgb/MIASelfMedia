/** 跳转收银台后返回 `/payment/success` 时，关联订单与测评（notify 无法写 localStorage） */
export const PAY_PENDING_SESSION_KEY = "mia_pay_pending";

export type PayPendingPayload = {
  orderNo: string;
  quizId: string;
  paidLabel: string;
  ts: number;
};

export function savePayPendingSession(payload: Omit<PayPendingPayload, "ts">): void {
  if (typeof window === "undefined") return;
  try {
    const full: PayPendingPayload = { ...payload, ts: Date.now() };
    sessionStorage.setItem(PAY_PENDING_SESSION_KEY, JSON.stringify(full));
  } catch {
    // private mode / quota
  }
}

export function readPayPendingSession(): PayPendingPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(PAY_PENDING_SESSION_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s) as PayPendingPayload;
    if (typeof parsed.orderNo !== "string" || !parsed.orderNo) return null;
    if (typeof parsed.quizId !== "string" || !parsed.quizId) return null;
    return {
      orderNo: parsed.orderNo,
      quizId: parsed.quizId,
      paidLabel: typeof parsed.paidLabel === "string" ? parsed.paidLabel : "",
      ts: typeof parsed.ts === "number" ? parsed.ts : Date.now(),
    };
  } catch {
    return null;
  }
}

export function clearPayPendingSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PAY_PENDING_SESSION_KEY);
  } catch {
    // ignore
  }
}

/** ZPay `param` 原样带回，用于 return/success URL 兜底 */
export function parsePayParamFromReturn(
  param: string | null,
): { quizId: string; paidLabel: string } | null {
  if (!param || !param.trim()) return null;
  try {
    const o = JSON.parse(param) as { quiz?: string; label?: string };
    if (typeof o.quiz !== "string" || !o.quiz) return null;
    return { quizId: o.quiz, paidLabel: typeof o.label === "string" ? o.label : "" };
  } catch {
    return null;
  }
}
