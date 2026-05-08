"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPaidStatus } from "@/utils/storage";
import { QuizOption } from "@/data/quizzes/mediaTalent";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const fullReportData: Record<QuizOption["type"], {
  name: string;
  coreTalent: string;
  recommendedTracks: string[];
  firstMonthPlan: string[];
  monetizationModel: string[];
}> = {
  creator: {
    name: "创作者人格",
    coreTalent: "你拥有与生俱来的视觉感知力和创意直觉，能够将抽象的概念转化为令人惊艳的视觉作品。你对美学有敏锐的嗅觉，擅长创造出独特且辨识度高的内容风格。这种能力在信息爆炸的时代尤为珍贵，能让你的作品在海量内容中脱颖而出。",
    recommendedTracks: ["短视频创意内容", "视觉设计/图文创作", "生活方式/美学博主", "艺术/创意类IP"],
    firstMonthPlan: [
      "第1周：确定内容定位，建立视觉风格库，拍摄30条素材",
      "第2周：发布前5条内容测试数据，优化封面和标题风格",
      "第3周：保持日更节奏，分析爆款规律，建立粉丝互动",
      "第4周：总结数据，确立首个爆款内容模式，开始变现尝试",
    ],
    monetizationModel: ["品牌广告合作", "视觉素材销售", "创意课程变现", "IP周边产品"],
  },
  operator: {
    name: "操盘手人格",
    coreTalent: "你具备出色的资源整合能力和系统化思维，能够看到项目的全貌并有效地推动执行。你擅长发现问题本质、调动资源、制定策略并落地执行。在自媒体领域，你是天生的项目管理者，能够把一个账号从0到1快速搭建起来。",
    recommendedTracks: ["知识付费运营", "电商带货操盘", "MCN机构运营", "企业自媒体代运营"],
    firstMonthPlan: [
      "第1周：选择赛道并对标10个头部账号，进行全面竞品分析",
      "第2周：制定内容框架和发布计划，建立数据监测体系",
      "第3周：执行并AB测试，快速迭代找到最优解",
      "第4周：搭建变现闭环，开始首个变现产品的推广",
    ],
    monetizationModel: ["广告分成计划", "星图接单变现", "带货佣金收入", "私域转化成交"],
  },
  storyteller: {
    name: "故事型人格",
    coreTalent: "你拥有强大的共情能力和表达天赋，擅长用真实而动人的故事打动人心。你能够洞察观众的情感需求，用恰到好处的叙事方式让他们产生共鸣。在算法越来越注重互动和留存的今天，你的这种能力是稀缺的流量密码。",
    recommendedTracks: ["情感/心理类内容", "个人成长/经历分享", "vlog记录类内容", "访谈/对话类内容"],
    firstMonthPlan: [
      "第1周：挖掘个人经历，整理10个可讲的故事素材",
      "第2周：练习叙事结构，发布3-5条故事型内容",
      "第3周：建立粉丝社群，开始收集粉丝故事",
      "第4周：尝试直播或连麦互动，强化人设连接",
    ],
    monetizationModel: ["情感咨询变现", "付费社群运营", "直播打赏收入", "品牌故事合作"],
  },
  analyst: {
    name: "分析师人格",
    coreTalent: "你具备缜密的逻辑思维和强大的数据敏感度，能够从纷繁复杂的信息中提炼出本质规律。你对平台算法、用户行为、内容趋势都有深入的理解，擅长用数据驱动决策。在自媒体竞争日益激烈的环境下，这种能力让你的每一步都走得更加精准。",
    recommendedTracks: ["科技/数码评测", "行业分析/商业观察", "数据/教程类内容", "财经/投资知识"],
    firstMonthPlan: [
      "第1周：选择细分领域，建立知识储备库，研究100个爆款案例",
      "第2周：确定内容框架，输出前5篇深度分析内容",
      "第3周：验证内容类型，关注数据指标并持续优化",
      "第4周：建立内容模板，开始向专业IP方向深化",
    ],
    monetizationModel: ["付费专栏订阅", "专业咨询顾问", "行业报告销售", "企业培训合作"],
  },
};

export default function FullReportPage() {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [personalityType, setPersonalityType] = useState<QuizOption["type"] | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const status = getPaidStatus("media-talent");

    if (!status) {
      router.replace("/quiz/media-talent/result");
      return;
    }

    setPersonalityType(status.type as QuizOption["type"]);
    setIsValid(true);
    setIsLoading(false);
  }, [router]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current || isDownloading) return;

    setIsDownloading(true);

    try {
      const element = contentRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#18181b",
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.setFillColor(24, 24, 27);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.setFillColor(24, 24, 27);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Mia图灵迷宫-${personalityType}-完整报告.pdf`);
    } catch (error) {
      console.error("PDF生成失败:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">加载中...</p>
      </div>
    );
  }

  if (!isValid || !personalityType) {
    return null;
  }

  const data = fullReportData[personalityType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100">
      {/* Header */}
      <nav className="border-b border-purple-900/30 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
              <span className="text-xs font-bold">M</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Mia的图灵迷宫</span>
          </Link>
        </div>
      </nav>

      {/* Content - Ref for PDF */}
      <main ref={contentRef} className="mx-auto max-w-4xl px-4 py-12" style={{ backgroundColor: "#18181b" }}>
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            完整AI人格报告
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-purple-100 mb-3">{data.name}</h1>
          <p className="text-zinc-400">深度解析你的自媒体天赋与成长路径</p>
        </div>

        {/* Core Talent Section */}
        <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8 mb-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/30 border border-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-purple-100">核心天赋解析</h2>
          </div>
          <p className="text-zinc-300 leading-relaxed">{data.coreTalent}</p>
        </div>

        {/* Recommended Tracks */}
        <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8 mb-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/30 border border-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-purple-100">推荐赛道</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {data.recommendedTracks.map((track, idx) => (
              <div key={idx} className="bg-zinc-800/50 rounded-xl p-4 text-center border border-purple-500/10">
                <span className="text-purple-300">{track}</span>
              </div>
            ))}
          </div>
        </div>

        {/* First Month Plan */}
        <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8 mb-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/30 border border-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-purple-100">起号首月计划</h2>
          </div>
          <div className="space-y-3">
            {data.firstMonthPlan.map((plan, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-zinc-800/50 rounded-xl p-4 border border-purple-500/10">
                <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center shrink-0 text-sm text-purple-300">
                  {idx + 1}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">{plan}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Monetization Model */}
        <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8 mb-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 to-fuchsia-600/30 border border-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-purple-100">变现模型</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {data.monetizationModel.map((model, idx) => (
              <div key={idx} className="bg-zinc-800/50 rounded-xl p-4 text-center border border-purple-500/10">
                <span className="text-purple-300">{model}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer in PDF */}
        <div className="text-center mt-8 pt-8 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm">© 2026 Mia的图灵迷宫 · 探索人格的无限可能</p>
        </div>
      </main>

      {/* Download Button - Outside PDF content */}
      <div className="mx-auto max-w-4xl px-4 pb-12 -mt-4">
        <div className="text-center mb-8">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isDownloading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                生成中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                下载PDF完整报告
              </>
            )}
          </button>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-zinc-500 text-sm hover:text-purple-400 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}