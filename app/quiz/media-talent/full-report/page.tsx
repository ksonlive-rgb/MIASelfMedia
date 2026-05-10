"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPaidStatus } from "@/utils/storage";
import {
  FinalScores,
  TrackScores,
  TrackType,
  abilityLabels,
  tracks,
  buildReportData,
} from "@/data/quizzes/mediaTalent";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface FullReportData {
  topTrack: TrackType;
  finalScores: FinalScores;
  trackScores: TrackScores;
}

function PlanCard({
  title,
  cycle,
  execution,
  monetization,
}: {
  title: string;
  cycle: string;
  execution: string;
  monetization: string;
}) {
  return (
    <div className="bg-zinc-800/50 border border-purple-500/10 rounded-xl p-4">
      <h5 className="text-purple-300 text-base font-semibold mb-3 border-b border-purple-500/10 pb-2">
        {title}
      </h5>
      <div className="mt-2">
        <strong className="text-purple-400 block text-sm mb-1">目标周期</strong>
        <p className="text-zinc-400 text-sm mb-3">{cycle}</p>
      </div>
      <div className="mt-2">
        <strong className="text-purple-400 block text-sm mb-1">执行方式/选题举例</strong>
        <p className="text-zinc-400 text-sm mb-3" dangerouslySetInnerHTML={{ __html: execution }} />
      </div>
      <div className="mt-2">
        <strong className="text-purple-400 block text-sm mb-1">变现方式</strong>
        <p className="text-zinc-400 text-sm" dangerouslySetInnerHTML={{ __html: monetization }} />
      </div>
    </div>
  );
}

export default function FullReportPage() {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [reportData, setReportData] = useState<FullReportData | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const status = getPaidStatus("media-talent");

    if (!status) {
      router.replace("/quiz/media-talent/result");
      return;
    }

    // Load stored scores from localStorage
    const storedScores = localStorage.getItem("media_talent_finalScores");
    const storedTrack = localStorage.getItem("media_talent_topTrack");
    const storedTrackScores = localStorage.getItem("media_talent_trackScores");

    if (storedScores && storedTrack && storedTrackScores) {
      setReportData({
        finalScores: JSON.parse(storedScores),
        topTrack: storedTrack as TrackType,
        trackScores: JSON.parse(storedTrackScores),
      });
    }

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

      const trackName = tracks[reportData!.topTrack].name.replace(/[🚀💖💡💰\s]/g, "");
      pdf.save(`Mia图灵迷宫-${trackName}-完整报告.pdf`);
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

  if (!isValid || !reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
        <p className="text-zinc-400 mb-4">没有找到测试结果</p>
        <Link href="/quiz/media-talent" className="text-purple-400 hover:text-purple-300">
          重新测试
        </Link>
      </div>
    );
  }

  const { topTrack, finalScores } = reportData;
  const data = buildReportData(topTrack, finalScores);
  const { track, sortedAbilities, getPercent, exampleTopic, monetization, costAnalysis } = data;

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
          <h1 className="text-3xl md:text-4xl font-bold text-purple-100 mb-3" dangerouslySetInnerHTML={{ __html: track.name }} />
          <p className="text-zinc-400">深度解析你的自媒体天赋与成长路径</p>
        </div>

        {/* 板块一：天赋诊断 */}
        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-4">✅ 板块一：天赋诊断</h2>

            <h3 className="text-lg font-semibold text-purple-300 mb-4">核心能力雷达图：</h3>
            <div className="grid grid-cols-5 gap-3">
              {sortedAbilities.map((ability, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{getPercent(ability.score)}%</div>
                  <div className="text-xs text-zinc-400">{ability.label}</div>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-purple-300 mt-6 mb-4">能力总结：</h3>
            <ul className="space-y-2">
              <li className="bg-zinc-800/50 p-3 rounded-lg text-sm text-zinc-300">
                <strong className="text-purple-400">主导天赋：</strong>{sortedAbilities[0].label}（得分 {getPercent(sortedAbilities[0].score)}%）。这代表你最强的底层驱动力，应作为内容创作的核心卖点。
              </li>
              <li className="bg-zinc-800/50 p-3 rounded-lg text-sm text-zinc-300">
                <strong className="text-purple-400">辅助能力：</strong>{sortedAbilities[1].label}（得分 {getPercent(sortedAbilities[1].score)}%）和 {sortedAbilities[2].label}（得分 {getPercent(sortedAbilities[2].score)}%）。这些能力可以帮你实现内容差异化和高效产出。
              </li>
              <li className="bg-zinc-800/50 p-3 rounded-lg text-sm text-zinc-300">
                <strong className="text-purple-400">诊断结论：</strong>你的天赋结构最适合打造<strong className="text-purple-300">{track.name}</strong>的个人IP，建议将你的<strong className="text-purple-300">{track.focus}</strong>能力发挥到极致。
              </li>
            </ul>
          </div>
        </div>

        {/* 板块二：赛道与对标 */}
        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-4">💡 板块二：赛道与对标</h2>

            <h3 className="text-lg font-semibold text-purple-300 mb-3">最佳赛道：<span dangerouslySetInnerHTML={{ __html: track.name }} /></h3>
            <p className="text-zinc-300 mb-4">
              <strong>建议人设：</strong>{track.persona}。这个定位将最大化利用你的<strong className="text-purple-300">{track.abilities.map(k => abilityLabels[k]).join("、")}</strong>优势。
            </p>

            <h3 className="text-lg font-semibold text-purple-300 mb-3">赛道现况分析：</h3>
            <ul className="space-y-2 mb-4">
              {track.analysis.map((text, idx) => (
                <li key={idx} className="bg-zinc-800/50 p-3 rounded-lg text-sm text-zinc-300" dangerouslySetInnerHTML={{ __html: text.replace(/<strong>/g, '<strong className="text-purple-400">').replace(/<\/strong>/g, "</strong>") }} />
              ))}
            </ul>

            <h3 className="text-lg font-semibold text-purple-300 mb-3">对标账号：</h3>
            <ul className="space-y-2">
              {track.rivals.map((r, idx) => (
                <li key={idx} className="bg-zinc-800/50 p-3 rounded-lg text-sm text-zinc-300">
                  <strong className="text-purple-400">{r}</strong>（搜索该账号，学习其选题逻辑、内容结构和互动方式）
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 板块三：运营规划 */}
        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-4">💰 板块三：运营规划</h2>

            <h3 className="text-lg font-semibold text-purple-300 mb-3">核心执行方式：</h3>
            <p className="text-zinc-300 mb-6">
              利用你的<strong className="text-purple-400">{sortedAbilities[0].label}</strong>天赋，确保内容的<strong className="text-purple-400">{track.focus.split("、")[0]}</strong>，同时克服<strong className="text-purple-400">{sortedAbilities[4].label}</strong>的短板（如需）。
            </p>

            <PlanCard
              title="前期（0-1000粉）"
              cycle="1-3个月"
              execution={`<strong>内容验证：</strong>专注于${exampleTopic.pre}。高频发布，快速测试用户反馈。`}
              monetization={`无，或<strong>私域预热</strong>（如：免费资料引流）。`}
            />
            <div className="mt-3" />
            <PlanCard
              title="中期（1000-10万粉）"
              cycle="4-12个月"
              execution={`<strong>打造爆款：</strong>深耕${exampleTopic.mid}。开始固定人设，形成稳定创作节奏。`}
              monetization={`${monetization.basic}。`}
            />
            <div className="mt-3" />
            <PlanCard
              title="后期（10万+粉）"
              cycle="1年以上"
              execution={`<strong>品牌升级：</strong>进行${exampleTopic.post}。孵化社群，开展IP多平台布局。`}
              monetization={`${monetization.advanced}。`}
            />

            <h3 className="text-lg font-semibold text-purple-300 mt-6 mb-3">成本分析：</h3>
            <ul className="space-y-2">
              <li className="bg-zinc-800/50 p-3 rounded-lg text-sm text-zinc-300">
                <strong className="text-purple-400">核心投入：</strong>{costAnalysis.focus}
              </li>
              <li className="bg-zinc-800/50 p-3 rounded-lg text-sm text-zinc-300">
                <strong className="text-purple-400">时间成本：</strong>初期建议每天投入<strong className="text-purple-400">{costAnalysis.time}小时</strong>小时用于内容制作和学习。
              </li>
              <li className="bg-zinc-800/50 p-3 rounded-lg text-sm text-zinc-300">
                <strong className="text-purple-400">设备建议：</strong>初期可使用手机和补光灯，专业设备可等到变现后再投入。
              </li>
            </ul>
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
