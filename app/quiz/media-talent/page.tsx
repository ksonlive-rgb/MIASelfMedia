"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mediaTalentQuiz, QuizOption } from "@/data/quizzes/mediaTalent";

export default function MediaTalentPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizOption["type"][]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const currentQuestion = mediaTalentQuiz[currentIndex];

  const handleSelect = (type: QuizOption["type"]) => {
    if (isAnimating) return;

    const newAnswers = [...answers, type];
    setAnswers(newAnswers);
    setIsAnimating(true);

    setTimeout(() => {
      if (currentIndex < mediaTalentQuiz.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsAnimating(false);
      } else {
        // Save answers to localStorage before navigation
        localStorage.setItem("media_talent_answers", JSON.stringify(newAnswers));
        router.push(`/quiz/media-talent/result?answers=${newAnswers.join(",")}`);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <nav className="border-b border-purple-900/30 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
              <span className="text-xs font-bold">M</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Mia的图灵迷宫</span>
          </div>
        </div>
      </nav>

      {/* Quiz Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-zinc-500">题目进度</span>
              <span className="text-sm text-purple-400 font-medium">
                {currentIndex + 1} / {mediaTalentQuiz.length}
              </span>
            </div>
            <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentIndex + 1) / mediaTalentQuiz.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div
            className={`bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-8 md:p-10 backdrop-blur-sm transition-all duration-300 ${
              isAnimating ? "opacity-50 scale-95" : "opacity-100 scale-100"
            }`}
          >
            <h2 className="text-xl md:text-2xl font-semibold text-purple-100 mb-8 leading-relaxed">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(option.type)}
                  disabled={isAnimating}
                  className="w-full text-left p-4 rounded-xl border border-purple-500/20 bg-zinc-800/50 text-zinc-200 transition-all duration-200 hover:bg-purple-600/20 hover:border-purple-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>

          {/* Question Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {mediaTalentQuiz.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-6 bg-purple-500"
                    : idx < currentIndex
                    ? "bg-purple-500/50"
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