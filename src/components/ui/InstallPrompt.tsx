"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone);
    setIsStandalone(standalone);

    // Check if dismissed before
    if (localStorage.getItem("install-dismissed")) {
      setDismissed(true);
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isiOS);

    // Listen for install prompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("install-dismissed", "1");
  };

  // Don't show if already installed or dismissed
  if (isStandalone || dismissed) return null;

  // Don't show if no prompt available and not iOS
  if (!deferredPrompt && !isIOS) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-[fadeUp_0.4s_ease-out]">
      <div className="max-w-lg mx-auto p-3 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] shadow-2xl shadow-black/50 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shrink-0">
          <span className="text-white text-lg font-serif">مصحف</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">تثبيت التطبيق</p>
          {isIOS ? (
            <p className="text-[11px] text-[var(--muted)] leading-tight">
              اضغط
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 inline mx-0.5 -mt-0.5">
                <path d="M13.75 7h-3V3.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L6.2 4.74a.75.75 0 001.1 1.02l1.95-2.1V7h-3A2.25 2.25 0 004 9.25v7.5A2.25 2.25 0 006.25 19h7.5A2.25 2.25 0 0016 16.75v-7.5A2.25 2.25 0 0013.75 7z" />
              </svg>
              ثم &quot;إضافة للشاشة الرئيسية&quot;
            </p>
          ) : (
            <p className="text-[11px] text-[var(--muted)]">ثبّت التطبيق على جهازك للوصول السريع</p>
          )}
        </div>
        {deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-bold shrink-0"
          >
            تثبيت
          </button>
        ) : null}
        <button
          onClick={handleDismiss}
          className="w-7 h-7 rounded-full bg-[var(--card-border)] flex items-center justify-center shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[var(--muted)]">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
