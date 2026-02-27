"use client";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { useStatsStore } from "@/stores/statsStore";

export default function StatsPage() {
  const { readings, currentStreak, longestStreak, totalKhatm, getWeekStats } = useStatsStore();
  const weekStats = getWeekStats();
  const totalPages = readings.reduce((sum, r) => sum + r.pagesRead, 0);
  const dayNames = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  return (
    <div className="max-w-lg mx-auto">
      <Header title="إحصائيات القراءة" showBack />
      <div className="px-4 py-6 space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <p className="text-3xl font-bold text-[var(--accent)]">{currentStreak}</p>
            <p className="text-xs text-[var(--muted)] mt-1">أيام متتالية 🔥</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-gold-400">{longestStreak}</p>
            <p className="text-xs text-[var(--muted)] mt-1">أطول سلسلة</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-[var(--foreground)]">{totalPages}</p>
            <p className="text-xs text-[var(--muted)] mt-1">إجمالي الصفحات</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-[var(--foreground)]">{totalKhatm}</p>
            <p className="text-xs text-[var(--muted)] mt-1">ختمات مكتملة</p>
          </Card>
        </div>

        {/* Weekly Activity */}
        <Card>
          <p className="font-bold mb-4">نشاط الأسبوع</p>
          <div className="flex items-end justify-between gap-1 h-32">
            {weekStats.map((day) => {
              const maxPages = Math.max(...weekStats.map((d) => d.pagesRead), 1);
              const height = (day.pagesRead / maxPages) * 100;
              const dayIndex = new Date(day.date).getDay();
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: "100px" }}>
                    <div
                      className={`w-full max-w-[30px] rounded-t-md transition-all ${
                        day.pagesRead > 0 ? "bg-primary-500" : "bg-[var(--card-border)]"
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-[var(--muted)]">{dayNames[dayIndex]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Reading Heatmap */}
        <Card>
          <p className="font-bold mb-4">سجل القراءة</p>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (27 - i));
              const dateStr = date.toISOString().split("T")[0];
              const reading = readings.find((r) => r.date === dateStr);
              const intensity = reading ? Math.min(reading.pagesRead / 5, 1) : 0;
              return (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  title={`${dateStr}: ${reading?.pagesRead || 0} صفحات`}
                  style={{
                    backgroundColor: intensity > 0
                      ? `rgba(34, 197, 94, ${0.2 + intensity * 0.8})`
                      : "var(--card-border)",
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[9px] text-[var(--muted)]">أقل</span>
            {[0, 0.25, 0.5, 0.75, 1].map((level) => (
              <div
                key={level}
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: level > 0
                    ? `rgba(34, 197, 94, ${0.2 + level * 0.8})`
                    : "var(--card-border)",
                }}
              />
            ))}
            <span className="text-[9px] text-[var(--muted)]">أكثر</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
