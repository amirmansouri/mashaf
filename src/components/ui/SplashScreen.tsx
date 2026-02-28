"use client";

import { useState, useEffect } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 2600);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0f1419] transition-opacity duration-600 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Logo */}
      <div className="mb-6 animate-[scaleIn_0.6s_ease-out]">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-2xl shadow-green-500/30">
          <span className="text-white text-5xl font-serif">مصحف</span>
        </div>
      </div>

      {/* App Name */}
      <h1 className="text-4xl font-bold text-white mb-2 animate-[fadeUp_0.6s_ease-out_0.3s_both]">
        مصحف
      </h1>
      <p className="text-green-400 text-lg mb-8 animate-[fadeUp_0.6s_ease-out_0.5s_both]">
        القرآن الكريم
      </p>

      {/* By mansouri */}
      <div className="absolute bottom-16 animate-[fadeUp_0.8s_ease-out_0.7s_both]">
        <p className="text-gray-500 text-sm tracking-wide">
          By <span className="text-gray-400 font-medium">mansouri</span>
        </p>
      </div>
    </div>
  );
}
