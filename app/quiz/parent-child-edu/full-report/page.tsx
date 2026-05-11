"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPaidStatus } from "@/utils/storage";
import {
  DimensionScores,
  eduTypes,
  dimensionLabels,
  actionPlanMap,
  AgeGroup,
  getChildDimensionTotal,
} from "@/data/quizzes/parentChildEdu";
import { getParentChildFullReportDetail } from "@/data/quizzes/parentChildEduFullReportDetail";
import { DownloadReportImageButton } from "@/components/quiz/DownloadReportImageButton";
import { PARENT_CHILD_LS } from "@/lib/quiz/parentChildStorage";
import {
  loadParentChildQuestionSequence,
  getChildPortraitText,
  getParentPortraitText,
  computeParentRadarFromAnswers,
  buildWisdomListFromAnswers,
  CHILD_RADAR_MAX,
  getReportBooks,
  getReportDocs,
} from "@/lib/quiz/parentChildReport";

interface FullReportData {
  dimScores: DimensionScores;
  eduType: number;
  age: AgeGroup;
}

function drawRadarChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  scores: number[],
  maxScores: number[]
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 40;
  const total = labels.length;
  const angleSlice = (2 * Math.PI) / total;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let level = 1; level <= 5; level++) {
    const r = (level / 5) * radius;
    ctx.beginPath();
    for (let i = 0; i < total; i++) {
      const angle = angleSlice * i - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "#374151";
    ctx.stroke();
  }

  for (let i = 0; i < total; i++) {
    const angle = angleSlice * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
    ctx.strokeStyle = "#374151";
    ctx.stroke();

    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "center";
    const labelX = centerX + (radius + 20) * Math.cos(angle);
    const labelY = centerY + (radius + 20) * Math.sin(angle);
    ctx.fillText(labels[i], labelX, labelY + 4);
  }

  ctx.beginPath();
  for (let i = 0; i < total; i++) {
    const ratio = Math.min(scores[i] / maxScores[i], 1);
    const angle = angleSlice * i - Math.PI / 2;
    const x = centerX + radius * ratio * Math.cos(angle);
    const y = centerY + radius * ratio * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(139, 92, 246, 0.2)";
  ctx.fill();
  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 0; i < total; i++) {
    const ratio = Math.min(scores[i] / maxScores[i], 1);
    const angle = angleSlice * i - Math.PI / 2;
    const x = centerX + radius * ratio * Math.cos(angle);
    const y = centerY + radius * ratio * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#8b5cf6";
    ctx.fill();
  }
}

export default function FullReportPage() {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<FullReportData | null>(null);
  const [questionSequence, setQuestionSequence] = useState<ReturnType<
    typeof loadParentChildQuestionSequence
  >>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const status = getPaidStatus("parent-child-edu");

    if (!status) {
      router.replace("/quiz/parent-child-edu/result");
      return;
    }

    const dimScoresStr = localStorage.getItem(PARENT_CHILD_LS.dimScores);
    const eduTypeStr = localStorage.getItem(PARENT_CHILD_LS.eduType);
    const ageStr = localStorage.getItem(PARENT_CHILD_LS.age) as AgeGroup;

    if (dimScoresStr && eduTypeStr !== null) {
      const age = ageStr || "3-5";
      setReportData({
        dimScores: JSON.parse(dimScoresStr),
        eduType: parseInt(eduTypeStr, 10),
        age,
      });
      setQuestionSequence(loadParentChildQuestionSequence(age));
    }

    setIsValid(true);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (!reportData || questionSequence.length === 0) return;

    const answersStr = localStorage.getItem(PARENT_CHILD_LS.answers);
    const answers = answersStr ? (JSON.parse(answersStr) as number[]) : [];

    const childCanvas = document.getElementById("childRadarChart") as HTMLCanvasElement | null;
    const parentCanvas = document.getElementById("parentRadarChart") as HTMLCanvasElement | null;

    if (childCanvas) {
      const { dimScores } = reportData;
      drawRadarChart(
        childCanvas,
        ["注意力", "情绪", "社交", "发育", "积极品质", "家庭", "家长行为"],
        [
          dimScores.focus,
          dimScores.emotion,
          dimScores.social,
          dimScores.development,
          dimScores.positive,
          dimScores.family,
          dimScores.parenting,
        ],
        [12, 12, 9, 9, 9, 15, 15]
      );
    }

    if (parentCanvas && answers.length > 0) {
      const parentRadar = computeParentRadarFromAnswers(
        reportData.dimScores,
        questionSequence,
        answers
      );
      drawRadarChart(parentCanvas, parentRadar.labels, parentRadar.scores, parentRadar.maxScores);
    }
  }, [reportData, questionSequence]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isValid || !reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100 flex flex-col items-center justify-center">
        <p className="text-zinc-400 mb-4">没有找到测试结果</p>
        <Link href="/quiz/parent-child-edu" className="text-purple-400 hover:text-purple-300">
          重新测试
        </Link>
      </div>
    );
  }

  const { dimScores, eduType, age } = reportData;
  const typeInfo = eduTypes[eduType];
  const plan = actionPlanMap[age]?.[eduType] ?? actionPlanMap["3-5"][0];
  const actions = plan?.items ?? [];

  const answersStr = localStorage.getItem(PARENT_CHILD_LS.answers);
  const answers = answersStr ? (JSON.parse(answersStr) as number[]) : [];
  const wisdomList = buildWisdomListFromAnswers(questionSequence, answers);

  const childTotal = getChildDimensionTotal(dimScores);
  const childPortrait = getChildPortraitText(childTotal);
  const parentPortrait = getParentPortraitText(dimScores);
  const books = getReportBooks(age, dimScores);
  const docs = getReportDocs(age, dimScores);

  const imageFileName = `Mia图灵迷宫-亲子教育画像-${typeInfo.main.replace(/[🧑‍👧\s]/g, "")}-完整报告`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-950 text-zinc-100">
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

      <main
        ref={contentRef}
        className="mx-auto max-w-4xl px-4 py-12"
        style={{ backgroundColor: "#18181b" }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            完整教育画像报告
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-purple-100 mb-3">🧑‍👧 {typeInfo.main}</h1>
          <p className="text-zinc-400">{typeInfo.sub}</p>
        </div>

        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-4">📋 画像详解</h2>
            <p className="text-zinc-300 leading-relaxed text-[15px] md:text-base">
              {getParentChildFullReportDetail(eduType)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-4">👶 孩子画像</h2>
            <p className="text-zinc-300 leading-relaxed mb-6">「{childPortrait}」</p>
            <div className="flex justify-center mb-6">
              <canvas id="childRadarChart" width={320} height={320} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(dimScores) as (keyof DimensionScores)[]).map((key) => {
                const value = dimScores[key];
                const max = CHILD_RADAR_MAX[key];
                const percent = Math.min(Math.round((value / max) * 100), 100);
                return (
                  <div key={key} className="bg-zinc-800/50 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-purple-400">{percent}%</div>
                    <div className="text-xs text-zinc-400">{dimensionLabels[key]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-4">🧑 家长画像</h2>
            <p className="text-zinc-300 leading-relaxed mb-6">「{parentPortrait}」</p>
            <div className="flex justify-center">
              <canvas id="parentRadarChart" width={320} height={320} />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-4">🧘 专属应对心法</h2>
            {wisdomList.length > 0 ? (
              <div className="space-y-4">
                {wisdomList.slice(0, 10).map((w, idx) => (
                  <div key={idx} className="bg-zinc-800/50 rounded-xl p-4">
                    <p className="text-purple-300 font-medium mb-2">💬 {w.scene}</p>
                    <p className="text-zinc-300 text-sm mb-2">应对：{w.advice}</p>
                    <p className="text-zinc-500 text-xs italic">原理：{w.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400 text-sm">您目前没有出现明显需关注的情景，继续保持！</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-4">🎯 行动方案</h2>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <h3 className="text-purple-300 font-medium mb-3">推荐行动清单</h3>
              <ul className="space-y-2">
                {actions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-zinc-300 text-sm">
                    <span className="text-purple-400 flex-shrink-0">✓</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-4">📅 分阶段目标</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-500/10">
                    <th className="text-left p-3 rounded-tl-xl text-purple-300">阶段</th>
                    <th className="text-left p-3 text-purple-300">重点</th>
                    <th className="text-left p-3 rounded-tr-xl text-purple-300">具体行动</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700/50">
                  <tr>
                    <td className="p-3">
                      <span className="font-medium text-purple-400">1-2周</span>
                      <br />
                      <span className="text-zinc-500 text-xs">关系修复</span>
                    </td>
                    <td className="p-3 text-zinc-300">停止负面互动</td>
                    <td className="p-3 text-zinc-400 text-xs">
                      每天10分钟特殊时光 · 暂停惩罚威胁 · 睡前一句肯定
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      <span className="font-medium text-purple-400">3-4周</span>
                      <br />
                      <span className="text-zinc-500 text-xs">核心奠基</span>
                    </td>
                    <td className="p-3 text-zinc-300">
                      {dimScores.emotion >= 7 ? "情绪觉察" : dimScores.focus >= 7 ? "专注习惯" : "家庭沟通"}
                    </td>
                    <td className="p-3 text-zinc-400 text-xs">
                      {dimScores.emotion >= 7 ? "情绪卡片 · 共读绘本" : "番茄钟 · 成功罐"}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      <span className="font-medium text-purple-400">5-8周</span>
                      <br />
                      <span className="text-zinc-500 text-xs">能力提升</span>
                    </td>
                    <td className="p-3 text-zinc-300">培养自主</td>
                    <td className="p-3 text-zinc-400 text-xs">自主安排作业 · 家庭小任务</td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      <span className="font-medium text-purple-400">9-12周</span>
                      <br />
                      <span className="text-zinc-500 text-xs">巩固成长</span>
                    </td>
                    <td className="p-3 text-zinc-300">内化习惯</td>
                    <td className="p-3 text-zinc-400 text-xs">庆祝进步 · 家长恢复个人时间</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-4">📚 推荐书单</h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-300 text-sm">
              {books.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-4">🎬 推荐纪录片</h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-300 text-sm">
              {docs.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-zinc-500 text-sm mb-8">报告基于测评生成，请灵活调整。</p>

        <div className="text-center pt-8 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm">© 2026 Mia的图灵迷宫 · 探索人格的无限可能</p>
        </div>
      </main>

      <div className="mx-auto max-w-4xl px-4 pb-12 -mt-4">
        <div className="text-center mb-8">
          <DownloadReportImageButton contentRef={contentRef} fileName={imageFileName} />
        </div>
        <div className="text-center">
          <Link href="/" className="text-zinc-500 text-sm hover:text-purple-400 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
