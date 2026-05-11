"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { savePaidStatus } from "@/utils/storage";
import {
  computePartnerRiskPercentage,
  getPartnerShortEvaluation,
  partnerLoyaltyQuizId,
  sumScores,
  partnerLoyaltyQuestions,
} from "@/data/quizzes/partnerLoyalty";
import { PARTNER_LOYALTY_LS } from "@/lib/quiz/partnerLoyaltyStorage";

const PARTNER_FULL_REPORT_HREF = "/quiz/partner-loyalty/full-report";

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  typeLabel: string;
}

function PaymentModal({ isOpen, onClose, typeLabel }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

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
      body: JSON.stringify({ type: "partner-loyalty" }),
    })
      .then((res) => res.json())
      .then((data) => {
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
  }, [isOpen]);

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
          savePaidStatus(partnerLoyaltyQuizId, typeLabel);
          setTimeout(() => {
            window.location.href = PARTNER_FULL_REPORT_HREF;
          }, 1500);
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [orderNo, isPolling, typeLabel]);

  const startPolling = () => {
    setIsPolling(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 md:p-8 shadow-2xl shadow-amber-900/20">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-600/30 to-yellow-700/30 border border-amber-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-amber-50 mb-2">解锁潜意识解密报告</h2>
          <p className="text-zinc-400 text-sm">支付后可查看完整报告</p>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400">正在创建订单...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-full bg-amber-600 text-white text-sm"
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
            <p className="text-green-400 font-semibold">处理完成！</p>
            <p className="text-zinc-400 text-sm mt-2">正在跳转...</p>
          </div>
        )}

        {!isLoading && !error && !isPaid && qrCode && (
          <>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-amber-400">¥9.9</span>
            </div>

            {!isPolling && (
              <div className="text-center">
                <img src={qrCode} alt="支付二维码" className="w-48 h-48 mx-auto mb-4 rounded-lg" />
                <p className="text-zinc-400 text-sm mb-4">请使用微信/支付宝扫码支付</p>
                <button
                  type="button"
                  onClick={startPolling}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-semibold transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25"
                >
                  我已支付
                </button>
              </div>
            )}

            {isPolling && (
              <div className="text-center py-4">
                <div className="w-8 h-8 mx-auto mb-4 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
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

export default function PartnerLoyaltyResultPage() {
  const [risk, setRisk] = useState<number | null>(null);
  const [displayRisk, setDisplayRisk] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const scoresStr = localStorage.getItem(PARTNER_LOYALTY_LS.scores);
    const riskStr = localStorage.getItem(PARTNER_LOYALTY_LS.risk);

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
          localStorage.setItem(PARTNER_LOYALTY_LS.risk, String(resolvedRisk));
        }
      } catch {
        resolvedRisk = null;
      }
    }

    if (resolvedRisk === null) return;
    setRisk(resolvedRisk);
  }, []);

  useEffect(() => {
    if (risk === null) return;

    const duration = 2500;
    const intervalMs = 20;
    const steps = duration / intervalMs;
    const stepValue = risk / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= risk) {
        current = risk;
        clearInterval(timer);
      }
      setDisplayRisk(Math.round(current));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [risk]);

  if (risk === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-amber-950/30 to-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
        <p className="text-zinc-400 mb-4">没有找到测试结果</p>
        <Link href="/quiz/partner-loyalty" className="text-amber-400 hover:text-amber-300">
          重新测试
        </Link>
      </div>
    );
  }

  const evalShort = getPartnerShortEvaluation(risk);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-amber-950/30 to-zinc-950 text-zinc-100 flex flex-col">
      <nav className="border-b border-amber-900/30 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-600 to-yellow-700 flex items-center justify-center">
              <span className="text-xs font-bold">M</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Mia的图灵迷宫</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-amber-50 mb-3">潜意识动荡与出轨风险指数</h1>
          <p className="text-zinc-400">基于50项微小行为切片生成</p>
        </div>

        <div className="bg-zinc-900/80 border border-amber-500/20 rounded-2xl p-8 mb-8 backdrop-blur-sm text-center">
          <p className="text-zinc-500 text-sm mb-4 tracking-widest">指数</p>
          <div
            className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl font-bold border-2 shadow-lg transition-colors duration-500 bg-zinc-800/80"
            style={{
              color: evalShort.color,
              borderColor: evalShort.color,
              boxShadow: `0 0 24px ${evalShort.color}33`,
            }}
          >
            {displayRisk}%
          </div>
          <h2 className="text-xl md:text-2xl font-semibold mb-4" style={{ color: evalShort.color }}>
            {evalShort.title}
          </h2>
          <p className="text-zinc-300 leading-relaxed text-left md:text-center max-w-2xl mx-auto">{evalShort.text}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-950/50 via-zinc-900/80 to-zinc-900/80 rounded-2xl p-8 border border-amber-500/40 text-center relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500 via-yellow-600 to-transparent"
          />

          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-600/30 border border-amber-500/30 flex items-center justify-center relative z-10">
            <svg className="w-8 h-8 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-amber-50 mb-2 relative z-10">🔒 解锁《潜意识性格解密报告》</h3>
          <p className="text-zinc-300 mb-6 relative z-10">
            选项背后的心理学逻辑、出轨画像预警、致命雷区与高阶相处指南
          </p>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="relative z-10 inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600 text-zinc-950 font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25"
          >
            <span>立即解锁</span>
            <span className="text-sm opacity-90">¥9.9</span>
          </button>

          <p className="text-zinc-500 text-xs mt-4 relative z-10">支付安全 · 24小时内可重复查看</p>
        </div>

        <div className="text-center mt-8">
          <Link href="/quiz/partner-loyalty" className="text-zinc-500 text-sm hover:text-amber-400 transition-colors">
            重新测试
          </Link>
          <span className="text-zinc-600 mx-2">|</span>
          <Link href="/" className="text-zinc-500 text-sm hover:text-amber-400 transition-colors">
            返回首页
          </Link>
        </div>
      </main>

      <PaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        typeLabel={evalShort.title}
      />
    </div>
  );
}
