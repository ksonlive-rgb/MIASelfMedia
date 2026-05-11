"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  partnerLoyaltyQuestions,
  computePartnerRiskPercentage,
  getPartnerShortEvaluation,
  type PartnerOption,
} from "@/data/quizzes/partnerLoyalty";
import { PARTNER_LOYALTY_LS } from "@/lib/quiz/partnerLoyaltyStorage";

function shuffleOptions(opts: PartnerOption[]): PartnerOption[] {
  const a = [...opts];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j]!;
    a[j] = tmp!;
  }
  return a;
}

export default function PartnerLoyaltyQuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayOptions, setDisplayOptions] = useState<PartnerOption[]>([]);

  const totalQuestions = partnerLoyaltyQuestions.length;
  const currentQuestion = partnerLoyaltyQuestions[currentIndex];

  useEffect(() => {
    const q = partnerLoyaltyQuestions[currentIndex];
    setDisplayOptions(shuffleOptions(q.options));
  }, [currentIndex]);

  const handleSelect = (score: number) => {
    if (isAnimating) return;

    const nextScores = [...scores, score];
    setScores(nextScores);
    setIsAnimating(true);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsAnimating(false);
      } else {
        const totalScore = nextScores.reduce((a, b) => a + b, 0);
        const risk = computePartnerRiskPercentage(totalScore);
        const evalShort = getPartnerShortEvaluation(risk);

        localStorage.setItem(PARTNER_LOYALTY_LS.scores, JSON.stringify(nextScores));
        localStorage.setItem(PARTNER_LOYALTY_LS.risk, String(risk));

        router.push("/quiz/partner-loyalty/result");
      }
    }, 300);
  };

  const progressPct = (currentIndex / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-amber-950/40 to-zinc-950 text-zinc-100 flex flex-col">
      <nav className="border-b border-amber-900/30 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-600 to-yellow-700 flex items-center justify-center">
              <span className="text-xs font-bold">M</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Mia的图灵迷宫</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-zinc-500">人格底色盲盒测试（潜意识扫描）</span>
              <span className="text-sm text-amber-400 font-medium">
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>
            <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-yellow-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div
            className={`bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-8 md:p-10 backdrop-blur-sm transition-all duration-300 ${
              isAnimating ? "opacity-50 scale-95" : "opacity-100 scale-100"
            }`}
          >
            <h2 className="text-xl md:text-2xl font-semibold text-amber-50 mb-8 leading-relaxed">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {displayOptions.map((opt, idx) => (
                <button
                  key={`${currentIndex}-${idx}-${opt.text.slice(0, 12)}`}
                  type="button"
                  onClick={() => handleSelect(opt.score)}
                  disabled={isAnimating}
                  className="w-full text-left p-4 rounded-xl border border-amber-500/20 bg-zinc-800/50 text-zinc-200 transition-all duration-200 hover:bg-amber-900/20 hover:border-amber-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-1.5 mt-6 flex-wrap">
            {partnerLoyaltyQuestions.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-6 bg-amber-500"
                    : idx < currentIndex
                      ? "bg-amber-500/50"
                      : "bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
