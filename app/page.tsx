"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HomeFaqModal, HomeFaqTrigger } from "@/components/HomeFaqModal";
import { SocialProofFullReportLine } from "@/components/SocialProofFullReportLine";
import { formatAccessCountdown } from "@/utils/formatAccessCountdown";
import { getPaidRemainingMs, getPaidStatus } from "@/utils/storage";

export default function Home() {
  const [hasMediaReport, setHasMediaReport] = useState(false);
  const [hasPartnerReport, setHasPartnerReport] = useState(false);
  const [hasParentReport, setHasParentReport] = useState(false);
  const [remainMediaMs, setRemainMediaMs] = useState<number | null>(null);
  const [remainPartnerMs, setRemainPartnerMs] = useState<number | null>(null);
  const [remainParentMs, setRemainParentMs] = useState<number | null>(null);
  const [faqOpen, setFaqOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      setHasMediaReport(!!getPaidStatus("media-talent"));
      setHasPartnerReport(!!getPaidStatus("partner-loyalty"));
      setHasParentReport(!!getPaidStatus("parent-child-edu"));
      setRemainMediaMs(getPaidRemainingMs("media-talent"));
      setRemainPartnerMs(getPaidRemainingMs("partner-loyalty"));
      setRemainParentMs(getPaidRemainingMs("parent-child-edu"));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-purple-900/30 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
              <span className="text-xs font-bold">M</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Mia的图灵迷宫</span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {hasMediaReport && (
              <Link
                href="/quiz/media-talent/full-report"
                className="rounded-full bg-zinc-800/50 border border-zinc-700/50 px-4 py-2 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-700/50 hover:border-zinc-600/50 flex flex-col items-center leading-tight"
              >
                <span>自媒体报告</span>
                {remainMediaMs != null && (
                  <span className="text-[10px] font-normal text-zinc-500 mt-0.5 tabular-nums">
                    剩余 {formatAccessCountdown(remainMediaMs)}
                  </span>
                )}
              </Link>
            )}
            {hasPartnerReport && (
              <Link
                href="/quiz/partner-loyalty/full-report"
                className="rounded-full bg-zinc-800/50 border border-zinc-700/50 px-4 py-2 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-700/50 hover:border-zinc-600/50 flex flex-col items-center leading-tight"
              >
                <span>忠诚度报告</span>
                {remainPartnerMs != null && (
                  <span className="text-[10px] font-normal text-zinc-500 mt-0.5 tabular-nums">
                    剩余 {formatAccessCountdown(remainPartnerMs)}
                  </span>
                )}
              </Link>
            )}
            {hasParentReport && (
              <Link
                href="/quiz/parent-child-edu/full-report"
                className="rounded-full bg-zinc-800/50 border border-zinc-700/50 px-4 py-2 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-700/50 hover:border-zinc-600/50 flex flex-col items-center leading-tight"
              >
                <span>亲子报告</span>
                {remainParentMs != null && (
                  <span className="text-[10px] font-normal text-zinc-500 mt-0.5 tabular-nums">
                    剩余 {formatAccessCountdown(remainParentMs)}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-purple-200 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Mia的图灵迷宫
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed">
            探索AI与人格的边界<br />
            发现你内心深处的数字灵魂
          </p>
        </div>

        {/* Test Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 max-w-2xl w-full mx-auto px-4">
          {/* Media Talent Test Card */}
          <Link href="/quiz/media-talent" className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-zinc-900/90 border border-purple-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm group-hover:border-purple-500/40 transition-all duration-300">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/30 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-purple-100 mb-1">自媒体天赋测试</h2>
                  <p className="text-zinc-400 text-sm">探索你在自媒体世界中的独特天赋与潜力</p>
                  <div className="mt-3 flex items-center gap-1.5 text-purple-400 text-xs font-medium">
                    <span>50题 · 约5分钟</span>
                    <span>·</span>
                    <span>立即测试</span>
                  </div>
                  <SocialProofFullReportLine quizId="media-talent" className="text-zinc-500 text-xs mt-2" />
                </div>
              </div>
            </div>
          </Link>

          {/* Parent Child Education Test Card */}
          <Link href="/quiz/parent-child-edu" className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-zinc-900/90 border border-amber-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-sm group-hover:border-amber-500/40 transition-all duration-300">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-600/30 to-orange-600/30 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <span className="text-3xl">🧑‍👧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-purple-100 mb-1">亲子教育画像测试</h2>
                  <p className="text-zinc-400 text-sm">理性看见孩子，也看见自己</p>
                  <div className="mt-3 flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                    <span>30题 · 约5分钟</span>
                    <span>·</span>
                    <span>立即测试</span>
                  </div>
                  <SocialProofFullReportLine quizId="parent-child-edu" className="text-zinc-500 text-xs mt-2" />
                </div>
              </div>
            </div>
          </Link>

          {/* Partner loyalty */}
          <Link href="/quiz/partner-loyalty" className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-amber-700 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
            <div className="relative bg-zinc-900/90 border border-yellow-500/25 rounded-2xl p-6 md:p-8 backdrop-blur-sm group-hover:border-yellow-500/45 transition-all duration-300">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-600/30 to-amber-700/30 border border-yellow-500/25 flex items-center justify-center shrink-0">
                  <span className="text-3xl">💛</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-purple-100 mb-1">伴侣忠诚度测试（情侣版）</h2>
                  <p className="text-zinc-400 text-sm">潜意识行为切片 · 人格底色与关系风险提示</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-yellow-400 text-xs font-medium">
                    <span>50题 · 约5分钟</span>
                    <span>·</span>
                    <span>立即测试</span>
                  </div>
                  <SocialProofFullReportLine quizId="partner-loyalty" className="text-zinc-500 text-xs mt-2" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-10 w-full max-w-2xl mx-auto px-4 pb-2">
          <HomeFaqTrigger onOpen={() => setFaqOpen(true)} />
        </div>
      </main>

      <HomeFaqModal open={faqOpen} onClose={() => setFaqOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-purple-900/20 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-zinc-500 text-sm">
          <p>© 2026 Mia的图灵迷宫 · 探索人格的无限可能</p>
        </div>
      </footer>
    </div>
  );
}
