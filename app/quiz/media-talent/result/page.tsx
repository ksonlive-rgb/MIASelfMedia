"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { QuizOption } from "@/data/quizzes/mediaTalent";

const personalityData = {
  creator: {
    name: "创作者人格",
    description: "你拥有独特的审美天赋和创意直觉，总能创造出令人眼前一亮的内容。你对视觉表达有敏锐的感知，擅长将抽象的想法转化为生动的作品。",
    freeAdvice: "继续保持你的创意热情，多观察生活中的美学元素，建立自己的视觉素材库。",
  },
  operator: {
    name: "操盘手人格",
    description: "你具备出色的资源整合能力和执行推动力，擅长发现问题、调动资源、推动项目落地。你是团队中不可或缺的中枢力量。",
    freeAdvice: "建议培养数据思维，用数据验证你的运营策略效果，让执行力插上数据的翅膀。",
  },
  storyteller: {
    name: "故事型人格",
    description: "你天生具有共情能力和表达欲，擅长用真实的故事打动人心。你能让观众产生情感共鸣，是天生的连接者。",
    freeAdvice: "多练习讲故事的结构技巧，学会用「起承转合」让你的故事更具张力。",
  },
  analyst: {
    name: "分析师人格",
    description: "你具备强大的逻辑思维和数据敏感度，擅长从现象中发现规律，用理性判断趋势。你是平台算法和用户行为的解读者。",
    freeAdvice: "尝试将你的分析能力可视化，用清晰的数据图表展示你的洞察，让更多人受益于你的分析。",
  },
};

function PaymentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-2xl shadow-purple-500/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/30 border border-purple-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-purple-100 mb-2">解锁完整AI人格报告</h2>
          <p className="text-zinc-400 text-sm">支付后可查看</p>
        </div>

        {/* Benefits List */}
        <div className="bg-zinc-800/50 rounded-xl p-4 mb-6 space-y-3">
          {[
            "账号定位",
            "起号建议",
            "内容方向",
            "流量优势",
            "AI时代成长路线",
            "未来风险提醒",
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm text-zinc-300">
              <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <span className="text-3xl font-bold text-purple-400">¥9.9</span>
        </div>

        {/* Pay Button */}
        <a
          href="https://zpayz.cn"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold text-center transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25"
        >
          立即支付
        </a>
      </div>
    </div>
  );
}

function ResultContent() {
  const [showModal, setShowModal] = useState(false);
  const searchParams = useSearchParams();
  const answersParam = searchParams.get("answers");

  if (!answersParam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">没有找到测试结果</p>
      </div>
    );
  }

  const answers = answersParam.split(",") as QuizOption["type"][];

  const typeCounts: Record<QuizOption["type"], number> = {
    creator: 0,
    operator: 0,
    storyteller: 0,
    analyst: 0,
  };

  answers.forEach((answer) => {
    if (answer in typeCounts) {
      typeCounts[answer]++;
    }
  });

  const dominantType = (Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]) as QuizOption["type"];

  const personality = personalityData[dominantType];

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

      {/* Result Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          {/* Success Badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              测试完成
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/30 border border-purple-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>

            <p className="text-purple-400 text-sm mb-2">你的自媒体天赋人格</p>
            <h1 className="text-3xl font-bold text-purple-100 mb-4">{personality.name}</h1>
            <p className="text-zinc-400 leading-relaxed mb-6">{personality.description}</p>

            {/* Free Advice */}
            <div className="bg-zinc-800/50 rounded-xl p-5 text-left border border-purple-500/10">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-purple-300 text-sm font-medium">免费建议</span>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">{personality.freeAdvice}</p>
            </div>
          </div>

          {/* Paywall */}
          <div className="mt-8 bg-gradient-to-r from-purple-900/40 to-fuchsia-900/40 rounded-2xl p-6 border border-purple-500/20">
            <p className="text-zinc-300 text-sm mb-4">
              解锁完整报告，获得更深入的性格分析和专属发展建议
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <span>立即解锁</span>
              <span className="text-sm opacity-80">¥9.9</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Back Home */}
          <Link
            href="/"
            className="inline-block mt-8 text-zinc-500 text-sm hover:text-purple-400 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">加载中...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}