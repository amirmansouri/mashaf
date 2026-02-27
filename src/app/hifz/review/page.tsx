"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function HifzReviewPage() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="max-w-lg mx-auto">
      <Header title="جلسة المراجعة" showBack />
      <div className="px-4 py-6 space-y-6">
        <Card className="text-center py-8">
          <p className="text-sm text-[var(--muted)] mb-4">اختبر نفسك - حاول تسميع الآية</p>

          <div className={`quran-text text-xl leading-[2.2] transition-all ${!revealed ? "blur-lg select-none" : ""}`}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </div>

          <Button className="mt-6" onClick={() => setRevealed(!revealed)}>
            {revealed ? "إخفاء" : "إظهار النص"}
          </Button>
        </Card>

        <div className="text-center text-sm text-[var(--muted)]">
          <p>هذه الميزة قيد التطوير</p>
          <p>ستتمكن قريباً من مراجعة حفظك مع نظام التكرار المتباعد</p>
        </div>
      </div>
    </div>
  );
}
