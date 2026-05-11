"use client";

import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { homeFaqItems } from "@/data/homeFaq";

const CUSTOMER_SERVICE_QQ = "3877173935";

interface HomeFaqModalProps {
  open: boolean;
  onClose: () => void;
}

export function HomeFaqModal({ open, onClose }: HomeFaqModalProps) {
  const [contactRevealed, setContactRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onKeyDown]);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setContactRevealed(false);
    }
  }, [open]);

  const handleContactClick = () => {
    void navigator.clipboard
      .writeText(CUSTOMER_SERVICE_QQ)
      .then(() => {
        setContactRevealed(true);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 3500);
      })
      .catch(() => {
        setContactRevealed(true);
      });
  };

  if (typeof document === "undefined" || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-faq-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="关闭"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-2xl border border-purple-500/20 bg-zinc-950/95 shadow-2xl shadow-purple-950/50 flex flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4 shrink-0">
          <h2 id="home-faq-title" className="text-base font-semibold text-zinc-100">
            常见问题
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-4 text-sm">
          {homeFaqItems.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 open:border-purple-500/25"
            >
              <summary className="cursor-pointer list-none px-4 py-3 font-medium text-purple-200/95 flex items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span className="text-zinc-600 text-xs shrink-0 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-4 pb-3 pt-3 text-zinc-400 leading-relaxed border-t border-zinc-800/50">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="border-t border-zinc-800/80 px-5 py-4 bg-zinc-900/30 shrink-0">
          <p className="text-xs text-zinc-500 mb-3 text-center">
            {contactRevealed
              ? "号码已复制，请在 QQ 中搜索添加好友后咨询"
              : "未解决？点击按钮获取客服 QQ（将自动复制到剪贴板）"}
          </p>
          {!contactRevealed ? (
            <button
              type="button"
              onClick={handleContactClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-700/80 hover:border-zinc-600 transition-colors"
            >
              <span className="opacity-80">💬</span>
              联系客服
            </button>
          ) : (
            <div className="rounded-xl border border-purple-500/25 bg-zinc-900/50 py-4 px-4 text-center space-y-2">
              <p className="text-xs text-purple-400/90">{copied ? "已复制到剪贴板" : "客服 QQ"}</p>
              <p className="text-lg font-medium tabular-nums tracking-wide text-zinc-100">
                {CUSTOMER_SERVICE_QQ}
              </p>
              <button
                type="button"
                onClick={() =>
                  void navigator.clipboard.writeText(CUSTOMER_SERVICE_QQ).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 2000);
                  })
                }
                className="text-xs text-zinc-500 hover:text-zinc-400 underline underline-offset-2"
              >
                再次复制
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function HomeFaqTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mx-auto block text-xs text-zinc-600 hover:text-zinc-400 underline-offset-4 hover:underline decoration-zinc-700 transition-colors"
    >
      常见问题
    </button>
  );
}
