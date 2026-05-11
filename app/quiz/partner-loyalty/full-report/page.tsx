"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPaidStatus } from "@/utils/storage";
import {
  getPartnerFullReportHtmlSections,
  getPartnerShortEvaluation,
  partnerLoyaltyQuizId,
  partnerLoyaltyQuestions,
  computePartnerRiskPercentage,
  sumScores,
} from "@/data/quizzes/partnerLoyalty";
import { PARTNER_LOYALTY_LS } from "@/lib/quiz/partnerLoyaltyStorage";
import { DownloadReportImageButton } from "@/components/quiz/DownloadReportImageButton";

export default function PartnerLoyaltyFullReportPage() {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [risk, setRisk] = useState<number | null>(null);

  useEffect(() => {
    const status = getPaidStatus(partnerLoyaltyQuizId);

    if (!status) {
      router.replace("/quiz/partner-loyalty/result");
      setIsLoading(false);
      return;
    }

    const riskStr = localStorage.getItem(PARTNER_LOYALTY_LS.risk);
    const scoresStr = localStorage.getItem(PARTNER_LOYALTY_LS.scores);

    let resolvedRisk: number | null = null;
    if (riskStr !== null) {
      resolvedRisk = parseInt(riskStr, 10);
      if (Number.isNaN(resolvedRisk)) resolvedRisk = null;
    }
    if (resolvedRisk === null && scoresStr) {
      try {
        const arr = JSON.parse(scoresStr) as number[];
        if (Array.isArray(arr) && arr.length === partnerLoyaltyQuestions.length) {
          resolvedRisk = computePartnerRiskPercentage(sumScores(arr));
        }
      } catch {
        resolvedRisk = null;
      }
    }

    if (resolvedRisk !== null) {
      setRisk(resolvedRisk);
      setIsValid(true);
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-amber-950/30 to-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isValid || risk === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-amber-950/30 to-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
        <p className="text-zinc-400 mb-4">没有找到测试结果</p>
        <Link href="/quiz/partner-loyalty" className="text-amber-400 hover:text-amber-300">
          重新测试
        </Link>
      </div>
    );
  }

  const [sec1, sec2, sec3, sec4] = getPartnerFullReportHtmlSections(risk);
  const evalShort = getPartnerShortEvaluation(risk);
  const imageFileName = `Mia图灵迷宫-伴侣忠诚度-${evalShort.title.replace(/[「」·\s]/g, "")}-完整报告`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-amber-950/25 to-zinc-950 text-zinc-100">
      <nav className="border-b border-amber-900/30 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-600 to-yellow-700 flex items-center justify-center">
              <span className="text-xs font-bold">M</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Mia的图灵迷宫</span>
          </Link>
        </div>
      </nav>

      <main
        ref={contentRef}
        className="mx-auto max-w-4xl px-4 py-12"
        style={{ backgroundColor: "#18181b" }}
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-sm mb-6">
            <span>深度潜意识解密报告</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-amber-50 mb-2">潜意识性格解密报告</h1>
          <p className="text-zinc-400 text-sm">基于行为心理学与50个微小生活切片生成 · 风险指数 {risk}%</p>
        </div>

        <div className="space-y-6 [&_.partner-report-hl]:text-amber-400 [&_.partner-report-hl]:font-medium">
          <section className="rounded-2xl bg-zinc-900/80 border border-zinc-700/50 border-l-4 border-l-amber-500 p-6 md:p-8 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <span aria-hidden>👁️</span> 核心潜意识大揭秘
            </h2>
            <div
              className="text-zinc-300 leading-relaxed text-[15px] md:text-base space-y-3 [&_p]:text-justify"
              dangerouslySetInnerHTML={{ __html: sec1 }}
            />
          </section>

          <section className="rounded-2xl bg-zinc-900/80 border border-zinc-700/50 border-l-4 border-l-red-500/90 p-6 md:p-8 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <span aria-hidden>⚠️</span> 专属出轨画像预警
            </h2>
            <div
              className="text-zinc-300 leading-relaxed text-[15px] md:text-base space-y-3 [&_p]:text-justify"
              dangerouslySetInnerHTML={{ __html: sec2 }}
            />
          </section>

          <section className="rounded-2xl bg-zinc-900/80 border border-zinc-700/50 border-l-4 border-l-teal-500/80 p-6 md:p-8 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <span aria-hidden>💣</span> 致命雷区盘点
            </h2>
            <div
              className="text-zinc-300 leading-relaxed text-[15px] md:text-base space-y-3 [&_p]:text-justify"
              dangerouslySetInnerHTML={{ __html: sec3 }}
            />
          </section>

          <section className="rounded-2xl bg-zinc-900/80 border border-zinc-700/50 border-l-4 border-l-rose-400/90 p-6 md:p-8 shadow-lg shadow-black/20">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <span aria-hidden>🎯</span> 高阶拿捏指南
            </h2>
            <div
              className="text-zinc-300 leading-relaxed text-[15px] md:text-base space-y-3 [&_p]:text-justify"
              dangerouslySetInnerHTML={{ __html: sec4 }}
            />
          </section>
        </div>

        <p className="text-center text-zinc-500 text-sm mb-8">报告基于测评生成，仅供参考。</p>

        <div className="text-center pt-8 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm">© 2026 Mia的图灵迷宫 · 探索人格的无限可能</p>
        </div>
      </main>

      <div className="mx-auto max-w-4xl px-4 pb-12 -mt-4">
        <div className="text-center mb-8">
          <DownloadReportImageButton
            contentRef={contentRef}
            fileName={imageFileName}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600 text-zinc-950 font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          />
        </div>
        <div className="text-center space-x-4">
          <Link href="/quiz/partner-loyalty/result" className="text-zinc-500 text-sm hover:text-amber-400 transition-colors">
            返回结果页
          </Link>
          <span className="text-zinc-600">|</span>
          <Link href="/" className="text-zinc-500 text-sm hover:text-amber-400 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
