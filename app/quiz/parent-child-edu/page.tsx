"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AgeGroup, getQuestionsForAge, processQuizResults, eduTypes } from "@/data/quizzes/parentChildEdu";
import { saveTestAccess } from "@/utils/storage";

const ageGroups: { key: AgeGroup; label: string; emoji: string }[] = [
  { key: "3-5", label: "3－5岁（学龄前）", emoji: "🍼" },
  { key: "6-8", label: "6－8岁（低年级）", emoji: "📘" },
  { key: "9-12", label: "9－12岁（中高年级）", emoji: "📗" },
  { key: "13-18", label: "13－18岁（青少年）", emoji: "📙" },
];

export default function ParentChildEduPage() {
  const [step, setStep] = useState<"age" | "quiz">("age");
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [questions, setQuestions] = useState<ReturnType<typeof getQuestionsForAge>>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const handleSelectAge = (age: AgeGroup) => {
    setSelectedAge(age);
    const qs = getQuestionsForAge(age);
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
    setCurrentIndex(0);
    setStep("quiz");
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isAnimating) return;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
    setIsAnimating(true);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsAnimating(false);
      } else {
        // 完成测试，保存结果并开启测试放行
        const numericAnswers = newAnswers.map(a => a ?? 0);
        const { dimScores, eduType } = processQuizResults(numericAnswers, questions);

        // 保存到 localStorage
        localStorage.setItem("parent_child_edu_answers", JSON.stringify(numericAnswers));
        localStorage.setItem("parent_child_edu_dimScores", JSON.stringify(dimScores));
        localStorage.setItem("parent_child_edu_eduType", String(eduType));
        localStorage.setItem("parent_child_edu_age", selectedAge ?? "3-5");

        // 开启24小时测试放行（无需支付）
        const typeLabel = `${selectedAge}-${eduTypes[eduType].main}`;
        saveTestAccess("parent-child-edu", typeLabel);

        // 跳转到结果页
        router.push(`/quiz/parent-child-edu/result`);
      }
    }, 300);
  };

  // 年龄选择页
  if (step === "age") {
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

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-purple-100 mb-3">🧑‍👧 亲子教育画像测试</h1>
            <p className="text-zinc-400">理性看见孩子 · 也看见自己</p>
          </div>

          <div className="w-full max-w-md bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <p className="text-purple-300 font-semibold mb-4 text-center">请选择孩子年龄阶段</p>
            <div className="space-y-3">
              {ageGroups.map((ag) => (
                <button
                  key={ag.key}
                  onClick={() => handleSelectAge(ag.key)}
                  className="w-full text-left p-4 rounded-xl border border-purple-500/20 bg-zinc-800/50 text-zinc-200 transition-all duration-200 hover:bg-purple-600/20 hover:border-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-purple-400 font-medium mr-3">{ag.emoji}</span>
                  {ag.label}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 测试页
  const currentQuestion = questions[currentIndex];

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

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-zinc-500">
                {selectedAge === "3-5" ? "🍼" : selectedAge === "6-8" ? "📘" : selectedAge === "9-12" ? "📗" : "📙"} {" "}
                {selectedAge === "3-5" ? "3-5岁" : selectedAge === "6-8" ? "6-8岁" : selectedAge === "9-12" ? "9-12岁" : "13-18岁"}
              </span>
              <span className="text-sm text-purple-400 font-medium">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="h-2 bg-zinc-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
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
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnimating}
                  className="w-full text-left p-4 rounded-xl border border-purple-500/20 bg-zinc-800/50 text-zinc-200 transition-all duration-200 hover:bg-purple-600/20 hover:border-purple-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-purple-400 font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {option.text}
                </button>
              ))}
            </div>
          </div>

          {/* Question Dots */}
          <div className="flex justify-center gap-1.5 mt-6 flex-wrap">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-6 bg-purple-500"
                    : idx < currentIndex
                    ? "bg-purple-500/50"
                    : answers[idx] !== null
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