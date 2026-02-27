"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useTarawihStore } from "@/stores/tarawihStore";

export default function TarawihPage() {
  const { plan, currentNight, createPlan, markNightComplete, resetPlan, getJuzForNight } = useTarawihStore();
  const [selectedPlan, setSelectedPlan] = useState<number>(30);

  const progress = plan ? Math.round((plan.completedNights.length / plan.totalNights) * 100) : 0;

  const planOptions = [
    { nights: 30, label: "٣٠ ليلة", desc: "جزء كل ليلة" },
    { nights: 20, label: "٢٠ ليلة", desc: "١.٥ جزء كل ليلة" },
    { nights: 10, label: "١٠ ليالي", desc: "٣ أجزاء كل ليلة" },
  ];

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto">
        <Header title="خطة التراويح" />
        <div className="px-4 py-6 space-y-6">
          <div className="text-center py-8">
            <span className="text-6xl">🌙</span>
            <h2 className="text-xl font-bold mt-4">أنشئ خطة التراويح</h2>
            <p className="text-[var(--muted)] text-sm mt-2">
              اختر عدد الليالي لإتمام ختمة القرآن الكريم
            </p>
          </div>

          <div className="space-y-3">
            {planOptions.map((opt) => (
              <Card
                key={opt.nights}
                onClick={() => setSelectedPlan(opt.nights)}
                className={`flex items-center justify-between ${
                  selectedPlan === opt.nights ? "border-[var(--accent)]" : ""
                }`}
              >
                <div>
                  <p className="font-bold">{opt.label}</p>
                  <p className="text-sm text-[var(--muted)]">{opt.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedPlan === opt.nights
                    ? "bg-primary-500 border-primary-500"
                    : "border-[var(--card-border)]"
                }`} />
              </Card>
            ))}
          </div>

          <Button fullWidth size="lg" onClick={() => createPlan(selectedPlan)}>
            ابدأ الخطة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Header title="خطة التراويح" />
      <div className="px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex flex-col items-center">
          <ProgressRing progress={progress} size={140} strokeWidth={10}>
            <div className="text-center">
              <p className="text-2xl font-bold">{progress}%</p>
              <p className="text-[10px] text-[var(--muted)]">مكتمل</p>
            </div>
          </ProgressRing>
          <p className="text-sm text-[var(--muted)] mt-3">
            {plan.completedNights.length} من {plan.totalNights} ليلة
          </p>
        </div>

        {/* Tonight's Reading */}
        <Link href="/tarawih/tonight">
          <Card gradient="primary" className="text-center">
            <p className="text-sm opacity-80">قراءة الليلة {currentNight}</p>
            <p className="text-xl font-bold mt-1">
              الجزء {getJuzForNight(currentNight).join(" و ")}
            </p>
            <p className="text-sm mt-2 opacity-90">اضغط للبدء</p>
          </Card>
        </Link>

        {/* Imam Mode */}
        <Link href="/tarawih/imam">
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕌</span>
              <div>
                <p className="font-bold">وضع الإمام</p>
                <p className="text-xs text-[var(--muted)]">نص كبير مع تمرير تلقائي</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-[var(--muted)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Card>
        </Link>

        {/* Nights Grid */}
        <div>
          <h3 className="font-bold mb-3">الليالي</h3>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: plan.totalNights }, (_, i) => i + 1).map((night) => {
              const completed = plan.completedNights.includes(night);
              const isCurrent = night === currentNight;
              return (
                <button
                  key={night}
                  onClick={() => !completed && markNightComplete(night)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                    completed
                      ? "bg-primary-600 text-white"
                      : isCurrent
                      ? "bg-primary-600/20 text-primary-400 border-2 border-primary-500"
                      : "bg-[var(--card)] text-[var(--muted)]"
                  }`}
                >
                  {night}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reset */}
        <Button variant="ghost" fullWidth onClick={resetPlan} className="text-red-400">
          إعادة تعيين الخطة
        </Button>
      </div>
    </div>
  );
}
