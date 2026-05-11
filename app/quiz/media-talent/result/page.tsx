"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import {
  FinalScores,
  TrackScores,
  TrackType,
  abilityLabels,
  tracks,
  buildReportData,
  mediaTalentQuiz,
} from "@/data/quizzes/mediaTalent";
import { SocialProofFullReportLine } from "@/components/SocialProofFullReportLine";
import { savePaidStatus } from "@/utils/storage";
import { savePayPendingSession } from "@/lib/pay/payPendingSession";

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  topTrack: TrackType;
}

function PaymentModal({ isOpen, onClose, topTrack }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !topTrack) return;

    setIsLoading(true);
    setError(null);
    setQrCode(null);
    setPayUrl(null);
    setOrderNo(null);
    setIsPaid(false);
    setIsPolling(false);

    fetch("/api/pay/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: topTrack }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (
          typeof data.orderNo === "string" &&
          data.orderNo &&
          typeof data.quizId === "string" &&
          data.quizId
        ) {
          savePayPendingSession({
            orderNo: data.orderNo,
            quizId: data.quizId,
            paidLabel: typeof data.paidLabel === "string" ? data.paidLabel : "",
          });
        }

        if (data.fallbackParams) {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = "https://zpayz.cn/submit.php";
          form.style.display = "none";

          Object.entries(data.fallbackParams).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
          return;
        }

        if (data.success && data.qrCode) {
          setQrCode(data.qrCode);
          setPayUrl(data.payUrl);
          setOrderNo(data.orderNo);

          if (isMobileDevice() && data.payUrl) {
            window.location.href = data.payUrl;
          }
        } else {
          setError(data.error || "创建订单失败");
        }
      })
      .catch(() => setError("网络错误"))
      .finally(() => setIsLoading(false));
  }, [isOpen, topTrack]);

  useEffect(() => {
    if (!orderNo || !isPolling) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/pay/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNo }),
        });
        const data = await res.json();

        if (data.paid) {
          setIsPaid(true);
          setIsPolling(false);
          clearInterval(interval);
          savePaidStatus("media-talent", topTrack);
          setTimeout(() => {
            window.location.href = "/payment/success";
          }, 1500);
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [orderNo, isPolling, topTrack]);

  const startPolling = () => {
    setIsPolling(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-zinc-900 border border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-2xl shadow-purple-500/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/30 border border-purple-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-purple-100 mb-2">解锁完整AI人格报告</h2>
          <p className="text-zinc-400 text-sm">支付后可查看完整报告</p>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400">正在创建订单...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-full bg-purple-600 text-white text-sm"
            >
              重试
            </button>
          </div>
        )}

        {isPaid && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-400 font-semibold">支付成功！</p>
            <p className="text-zinc-400 text-sm mt-2">正在跳转...</p>
          </div>
        )}

        {!isLoading && !error && !isPaid && qrCode && (
          <>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-purple-400">¥9.9</span>
            </div>

            {!isPolling && (
              <div className="text-center">
                <img src={qrCode} alt="支付二维码" className="w-48 h-48 mx-auto mb-4 rounded-lg" />
                <p className="text-zinc-400 text-sm mb-4">请使用微信/支付宝扫码支付</p>
                <button
                  onClick={startPolling}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25"
                >
                  我已支付
                </button>
              </div>
            )}

            {isPolling && (
              <div className="text-center py-4">
                <div className="w-8 h-8 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-400 text-sm">检测支付结果中...</p>
              </div>
            )}
          </>
        )}

        {!isLoading && !error && !qrCode && !isPaid && (
          <div className="text-center">
            <p className="text-zinc-400 mb-4">正在准备支付...</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ReportData {
  topTrack: TrackType;
  finalScores: FinalScores;
  trackScores: TrackScores;
}

function ResultContent() {
  const [showModal, setShowModal] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const searchParams = useSearchParams();
  const answersParam = searchParams.get("answers");

  useEffect(() => {
    // Try URL first, then localStorage
    let answerIndices: number[] = [];

    if (answersParam) {
      answerIndices = answersParam.split(",").map(Number);
    } else {
      const stored = localStorage.getItem("media_talent_answers");
      if (stored) {
        try {
          answerIndices = JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }

    if (answerIndices.length === 0) return;

    // Get stored scores if available
    const storedScores = localStorage.getItem("media_talent_finalScores");
    const storedTrack = localStorage.getItem("media_talent_topTrack");
    const storedTrackScores = localStorage.getItem("media_talent_trackScores");

    if (storedScores && storedTrack && storedTrackScores) {
      setReportData({
        finalScores: JSON.parse(storedScores),
        topTrack: storedTrack as TrackType,
        trackScores: JSON.parse(storedTrackScores),
      });
    } else {
      // Recalculate from answers
      const { finalScores, trackScores, topTrack } = require("@/data/quizzes/mediaTalent").processQuizResults(answerIndices);
      setReportData({ finalScores, trackScores, topTrack });
    }
  }, [answersParam]);

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
        <p className="text-zinc-400 mb-4">没有找到测试结果</p>
        <Link href="/quiz/media-talent" className="text-purple-400 hover:text-purple-300">
          重新测试
        </Link>
      </div>
    );
  }

  const { topTrack, finalScores, trackScores } = reportData;
  const data = buildReportData(topTrack, finalScores);
  const { track, sortedAbilities, getPercent, exampleTopic, monetization, costAnalysis } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100 flex flex-col">
      <nav className="border-b border-purple-900/30 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
              <span className="text-xs font-bold">M</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Mia的图灵迷宫</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-100 mb-3">🎉 你的专属自媒体创业报告</h1>
          <p className="text-zinc-400">基于50道专业测试，深度解析你的自媒体天赋</p>
        </div>

        {/* Quick Result Card */}
        <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 mb-6 backdrop-blur-sm">
          <div className="text-center mb-4">
            <p className="text-purple-400 text-sm mb-2">最佳匹配赛道</p>
            <h2 className="text-2xl font-bold text-purple-100" dangerouslySetInnerHTML={{ __html: track.name }} />
          </div>
          <p className="text-zinc-300 text-center">
            {track.persona}
          </p>
        </div>

        {/* Free Preview Section */}
        <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 mb-6 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-purple-100 mb-4">✅ 能力雷达图</h3>
          <div className="grid grid-cols-5 gap-3">
            {sortedAbilities.map((ability, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl font-bold text-purple-400">{getPercent(ability.score)}%</div>
                <div className="text-xs text-zinc-400">{ability.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/60 via-fuchsia-900/40 to-zinc-900/80 rounded-2xl p-8 border border-purple-500/40 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500 via-fuchsia-500 to-transparent" />

          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-purple-100 mb-2">🔒 你的专属规划指南</h3>
          <p className="text-zinc-300 mb-6">
            对标账号 · 运营规划 · 成本分析 · 变现方案<br />
            <span className="text-purple-400 text-sm">支付后即可解锁完整报告</span>
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          >
            <span>立即解锁</span>
            <span className="text-sm opacity-90">¥9.9</span>
          </button>

          <div className="relative z-10">
            <SocialProofFullReportLine quizId="media-talent" className="text-zinc-500 text-xs mt-3" />
          </div>

          <p className="text-zinc-500 text-xs mt-4">支付安全 · 24小时内可重复查看</p>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-zinc-500 text-sm hover:text-purple-400 transition-colors">
            返回首页
          </Link>
        </div>
      </main>

      <PaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        topTrack={topTrack}
      />
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