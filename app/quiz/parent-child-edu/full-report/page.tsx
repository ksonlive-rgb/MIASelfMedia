"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPaidStatus } from "@/utils/storage";
import {
  DimensionScores,
  eduTypes,
  dimensionLabels,
  wisdomMap,
  actionPlanMap,
  questionBank,
  AgeGroup,
} from "@/data/quizzes/parentChildEdu";

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

  // Draw background circles
  ctx.strokeStyle = "#374151";
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
    ctx.stroke();
  }

  // Draw axes
  for (let i = 0; i < total; i++) {
    const angle = angleSlice * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
    ctx.strokeStyle = "#374151";
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "center";
    const labelX = centerX + (radius + 20) * Math.cos(angle);
    const labelY = centerY + (radius + 20) * Math.sin(angle);
    ctx.fillText(labels[i], labelX, labelY + 4);
  }

  // Draw data polygon
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

  // Draw data points
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
  const [isTestMode, setIsTestMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 检查是否有访问权限
    const status = getPaidStatus("parent-child-edu");

    if (!status) {
      router.replace("/quiz/parent-child-edu/result");
      return;
    }

    // 检查是否是测试模式
    if (status.testMode) {
      setIsTestMode(true);
    }

    // 加载保存的结果数据
    const dimScoresStr = localStorage.getItem("parent_child_edu_dimScores");
    const eduTypeStr = localStorage.getItem("parent_child_edu_eduType");
    const ageStr = localStorage.getItem("parent_child_edu_age") as AgeGroup;

    if (dimScoresStr && eduTypeStr !== null) {
      setReportData({
        dimScores: JSON.parse(dimScoresStr),
        eduType: parseInt(eduTypeStr, 10),
        age: ageStr || "3-5",
      });
    }

    setIsValid(true);
    setIsLoading(false);
  }, [router]);

  // 绘制雷达图
  useEffect(() => {
    if (!reportData) return;

    const canvas = document.getElementById("radarChart") as HTMLCanvasElement;
    if (canvas) {
      const labels = Object.keys(reportData.dimScores).map(
        (k) => dimensionLabels[k as keyof DimensionScores]
      );
      const scores = Object.values(reportData.dimScores);
      const maxScores = [15, 15, 12, 12, 12, 15, 15];
      drawRadarChart(canvas, labels, scores, maxScores);
    }
  }, [reportData]);

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
  const actions = actionPlanMap[age]?.[eduType]?.items || [];

  // 获取高 score 的题目对应的 wisdom
  const answersStr = localStorage.getItem("parent_child_edu_answers");
  const wisdomList: { scene: string; advice: string; reason: string }[] = [];

  if (answersStr) {
    const answers = JSON.parse(answersStr) as number[];
    const questions = questionBank[age]?.concat(questionBank["common"] || []) || [];

    questions.forEach((q, idx) => {
      const answerIdx = answers[idx];
      if (answerIdx !== undefined && q.options[answerIdx]?.score >= 2) {
        const wisdom = wisdomMap[q.id];
        if (wisdom) {
          wisdomList.push(wisdom);
        }
      }
    });
  }

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
          {isTestMode && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              测试放行
            </span>
          )}
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-8">
          {isTestMode && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs mb-4">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              24小时测试期间免费查看
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            完整教育画像报告
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-purple-100 mb-3">🧑‍👧 {typeInfo.main}</h1>
          <p className="text-zinc-400">{typeInfo.sub}</p>
        </div>

        {/* Section 1: Type Description */}
        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-4">📋 画像解读</h2>
            <p className="text-zinc-300 leading-relaxed mb-4">{typeInfo.desc}</p>
            <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <p className="text-amber-200 font-medium mb-1">💡 改善方向</p>
              <p className="text-zinc-400 text-sm">{typeInfo.advice}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Radar Chart */}
        <div className="mb-6">
          <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-purple-100 mb-6">📊 维度分析雷达图</h2>
            <div className="flex justify-center">
              <canvas id="radarChart" width={320} height={320} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {(Object.keys(dimScores) as (keyof DimensionScores)[]).map((key) => {
                const value = dimScores[key];
                const maxMap: Record<keyof DimensionScores, number> = {
                  focus: 15, emotion: 15, social: 12,
                  development: 12, positive: 12, family: 15, parenting: 15
                };
                const max = maxMap[key];
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

        {/* Section 3: Wisdom List */}
        {wisdomList.length > 0 && (
          <div className="mb-6">
            <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-purple-100 mb-4">🧘 专属应对心法</h2>
              <div className="space-y-4">
                {wisdomList.slice(0, 10).map((w, idx) => (
                  <div key={idx} className="bg-zinc-800/50 rounded-xl p-4">
                    <p className="text-purple-300 font-medium mb-2">💬 {w.scene}</p>
                    <p className="text-zinc-300 text-sm mb-2">应对：{w.advice}</p>
                    <p className="text-zinc-500 text-xs italic">原理：{w.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Action Plan */}
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

        {/* Section 5: Stage Goals */}
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
                      <span className="font-medium text-purple-400">1-2周</span><br />
                      <span className="text-zinc-500 text-xs">关系修复</span>
                    </td>
                    <td className="p-3 text-zinc-300">停止负面互动</td>
                    <td className="p-3 text-zinc-400 text-xs">
                      每天10分钟特殊时光 · 暂停惩罚威胁 · 睡前一句肯定
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      <span className="font-medium text-purple-400">3-4周</span><br />
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
                      <span className="font-medium text-purple-400">5-8周</span><br />
                      <span className="text-zinc-500 text-xs">能力提升</span>
                    </td>
                    <td className="p-3 text-zinc-300">培养自主</td>
                    <td className="p-3 text-zinc-400 text-xs">自主安排作业 · 家庭小任务</td>
                  </tr>
                  <tr>
                    <td className="p-3">
                      <span className="font-medium text-purple-400">9-12周</span><br />
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

        {/* Footer */}
        <div className="text-center pt-8 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm">© 2026 Mia的图灵迷宫 · 探索人格的无限可能</p>
          {isTestMode && (
            <p className="text-zinc-600 text-xs mt-2">
              测试放行有效期至：{new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString("zh-CN")}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}