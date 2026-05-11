"use client";

import { useEffect, useState } from "react";
import { type SocialProofQuizId, getSocialProofFullReportCount } from "@/utils/socialProofFullReport";

interface SocialProofFullReportLineProps {
  quizId: SocialProofQuizId;
  className?: string;
}

export function SocialProofFullReportLine({
  quizId,
  className = "text-zinc-500 text-xs mt-2",
}: SocialProofFullReportLineProps) {
  const [label, setLabel] = useState(() =>
    getSocialProofFullReportCount(quizId).toLocaleString("zh-CN"),
  );

  useEffect(() => {
    const tick = () => {
      setLabel(getSocialProofFullReportCount(quizId).toLocaleString("zh-CN"));
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [quizId]);

  return (
    <p className={className} aria-live="polite">
      已有{label}人获取完整报告
    </p>
  );
}
