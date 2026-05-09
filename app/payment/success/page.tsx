"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { savePaidStatus } from "@/utils/storage";

export default function PaymentSuccessPage() {
  const [showCheck, setShowCheck] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    setShowCheck(true);

    // Check if we have stored answers from the quiz
    const storedAnswers = localStorage.getItem("media_talent_answers");
    if (storedAnswers) {
      try {
        const answers = JSON.parse(storedAnswers);
        if (answers && answers.length > 0) {
          setHasResult(true);
          // Write paid status since user completed payment
          const typeCounts: Record<string, number> = {
            creator: 0,
            operator: 0,
            storyteller: 0,
            analyst: 0,
          };
          answers.forEach((answer: string) => {
            if (answer in typeCounts) typeCounts[answer]++;
          });
          const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];
          savePaidStatus("media-talent", dominantType);
        }
      } catch {
        // ignore parse error
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
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

      {/* Success Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          {/* Success Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
              <svg
                className={`w-12 h-12 text-green-400 transition-all duration-700 ${
                  showCheck ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
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
            </div>
            {/* Glow Effect */}
            <div
              className={`absolute inset-0 w-24 h-24 mx-auto rounded-full bg-green-500/20 blur-xl transition-all duration-1000 ${
                showCheck ? "scale-150 opacity-100" : "scale-50 opacity-0"
              }`}
            />
          </div>

          {/* Text Content */}
          <h1 className="text-3xl font-bold text-purple-100 mb-3">支付成功</h1>
          <p className="text-zinc-400 mb-10">你的完整AI人格报告已解锁</p>

          {/* View Report Button */}
          {hasResult ? (
            <Link
              href="/quiz/media-talent/full-report"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              查看完整报告
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              返回首页
            </Link>
          )}

          {/* Back Home */}
          <Link
            href="/"
            className="inline-block mt-8 text-zinc-500 text-sm hover:text-purple-400 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </main>
    </div>
  );
}