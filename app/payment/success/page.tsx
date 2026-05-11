"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { savePaidStatus } from "@/utils/storage";
import {
  readPayPendingSession,
  clearPayPendingSession,
  parsePayParamFromReturn,
} from "@/lib/pay/payPendingSession";

const FULL_REPORT_HREF: Record<string, string> = {
  "parent-child-edu": "/quiz/parent-child-edu/full-report",
  "partner-loyalty": "/quiz/partner-loyalty/full-report",
  "media-talent": "/quiz/media-talent/full-report",
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<"checking" | "unlocked" | "idle" | "verify_fail">("checking");
  const [reportHref, setReportHref] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const outFromUrl = searchParams.get("out_trade_no");
    const paramFromUrl = searchParams.get("param");
    const tradeStatus = searchParams.get("trade_status");

    const pending = readPayPendingSession();
    const fromParam = parsePayParamFromReturn(paramFromUrl);

    const orderNo = (outFromUrl && outFromUrl.trim()) || pending?.orderNo || null;

    const quizId = pending?.quizId || fromParam?.quizId || null;
    const paidLabel = pending?.paidLabel ?? fromParam?.paidLabel ?? "";

    async function poll() {
      if (!orderNo) {
        setPhase("idle");
        setHint(
          "如需查看完整报告，请从首页进入对应测评；若刚从支付宝返回，可先返回测评结果页再试。",
        );
        return;
      }

      const maxAttempts = 45;
      for (let attempts = 0; attempts < maxAttempts; attempts += 1) {
        try {
          const res = await fetch("/api/pay/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderNo }),
          });
          const data = (await res.json()) as { paid?: boolean };

          if (data.paid) {
            let q = quizId;
            let lab = paidLabel;
            if (!q) {
              const q2 = parsePayParamFromReturn(paramFromUrl);
              if (q2) {
                q = q2.quizId;
                lab = q2.paidLabel;
              }
            }

            if (!q) {
              setPhase("verify_fail");
              setHint(
                "付款已确认，但无法匹配测评类型。请打开对应测评的「精简结果页」，点击「我已支付」完成解锁。",
              );
              return;
            }

            savePaidStatus(q, lab);
            clearPayPendingSession();

            const href = FULL_REPORT_HREF[q] ?? "/";
            setReportHref(href);
            setPhase("unlocked");
            return;
          }
        } catch {
          // continue polling
        }
        await new Promise((r) => setTimeout(r, 2000));
      }

      setPhase("verify_fail");
      setHint(
        tradeStatus === "TRADE_SUCCESS"
          ? "暂未从支付平台同步到付款结果，请 1～2 分钟后刷新本页，或返回测评结果页点击「我已支付」。"
          : "暂未确认支付结果。若您已付款，请稍后刷新本页，或通过结果页的「我已支付」再次检测。",
      );
    }

    void poll();
  }, [searchParams]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
            {phase === "checking" ? (
              <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-12 h-12 text-green-400 scale-100 opacity-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-purple-100 mb-3">
          {phase === "unlocked" ? "支付成功" : phase === "checking" ? "正在确认支付" : "支付处理"}
        </h1>

        {phase === "unlocked" && reportHref && (
          <>
            <p className="text-zinc-400 mb-10">完整报告已解锁，点击下方按钮查看。</p>
            <Link
              href={reportHref}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              查看完整报告
            </Link>
          </>
        )}

        {(phase === "idle" || phase === "verify_fail") && hint && (
          <p className="text-zinc-400 mb-8 text-sm leading-relaxed">{hint}</p>
        )}

        {phase !== "unlocked" && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-zinc-800 border border-zinc-600 text-zinc-200 font-medium transition-all hover:bg-zinc-700"
          >
            返回首页
          </Link>
        )}

        <Link
          href="/"
          className="inline-block mt-8 text-zinc-500 text-sm hover:text-purple-400 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100 flex flex-col">
      <nav className="border-b border-purple-900/30 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
              <span className="text-xs font-bold">M</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Mia的图灵迷宫</span>
          </Link>
        </div>
      </nav>

      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center text-zinc-400">加载中...</div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
