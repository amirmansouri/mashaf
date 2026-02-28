"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useQuranStore } from "@/stores/quranStore";
import { useTarawihStore } from "@/stores/tarawihStore";
import { useStatsStore } from "@/stores/statsStore";
import { useWirdStore } from "@/stores/wirdStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { toHijri, formatHijri, isRamadan, getRamadanDay } from "@/lib/hijriDate";
import { calculatePrayerTimes, getNextPrayer, formatTime, getTimeUntil } from "@/lib/prayerTimes";

export default function HomePage() {
  const lastRead = useQuranStore((s) => s.lastRead);
  const tarawihPlan = useTarawihStore((s) => s.plan);
  const totalKhatm = useStatsStore((s) => s.totalKhatm);
  const readings = useStatsStore((s) => s.readings);
  const wirdStreak = useWirdStore((s) => s.streak);
  const location = useSettingsStore((s) => s.location);
  const [hijri, setHijri] = useState<string>("");
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHijri(formatHijri(toHijri()));
  }, []);

  useEffect(() => {
    if (!location) return;
    const update = () => {
      const times = calculatePrayerTimes(location.lat, location.lng);
      const next = getNextPrayer(times);
      if (next) {
        const until = getTimeUntil(next.time);
        setNextPrayer({
          name: next.name,
          time: formatTime(next.time),
          countdown: `${until.hours}:${String(until.minutes).padStart(2, "0")}:${String(until.seconds).padStart(2, "0")}`,
        });
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [location]);

  if (!mounted) return null;

  const ramadanDay = getRamadanDay();
  const today = new Date().toISOString().split("T")[0];
  const todayStats = readings.find((r) => r.date === today);
  const tarawihProgress = tarawihPlan
    ? Math.round((tarawihPlan.completedNights.length / tarawihPlan.totalNights) * 100)
    : 0;

  const quickLinks = [
    { label: "القرآن", icon: "📖", href: "/quran", color: "from-emerald-600 to-emerald-800" },
    { label: "التراويح", icon: "🌙", href: "/tarawih", color: "from-indigo-600 to-indigo-800" },
    { label: "الأذكار", icon: "🤲", href: "/adhkar", color: "from-amber-600 to-amber-800" },
    { label: "الصلاة", icon: "🕌", href: "/prayer", color: "from-sky-600 to-sky-800" },
    { label: "البحث", icon: "🔍", href: "/search", color: "from-purple-600 to-purple-800" },
    { label: "الحفظ", icon: "🧠", href: "/hifz", color: "from-rose-600 to-rose-800" },
    { label: "حالتك", icon: "💚", href: "/mood", color: "from-teal-600 to-teal-800" },
    { label: "رمضان", icon: "🏮", href: "/ramadan", color: "from-orange-600 to-orange-800" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مصحف</h1>
          <p className="text-sm text-[var(--muted)]">{hijri}</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Ramadan Banner */}
      {isRamadan() && (
        <Card gradient="primary" className="relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm opacity-80">رمضان كريم</p>
            <p className="text-2xl font-bold mt-1">اليوم {ramadanDay} من رمضان</p>
            {tarawihPlan && (
              <p className="text-sm mt-2 opacity-90">
                ختمة التراويح: {tarawihPlan.completedNights.length}/{tarawihPlan.totalNights} ليلة
              </p>
            )}
          </div>
          <div className="absolute top-2 left-2 text-6xl opacity-20">🌙</div>
        </Card>
      )}

      {/* Next Prayer */}
      {nextPrayer && (
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--muted)]">الصلاة القادمة</p>
            <p className="text-lg font-bold">{nextPrayer.name}</p>
            <p className="text-sm text-[var(--muted)]">{nextPrayer.time}</p>
          </div>
          <div className="text-left">
            <p className="text-2xl font-mono font-bold text-[var(--accent)]" dir="ltr">
              {nextPrayer.countdown}
            </p>
          </div>
        </Card>
      )}

      {/* Continue Reading */}
      {lastRead && (
        <Link href={`/quran/${lastRead.surah}`}>
          <Card className="flex items-center justify-between hover:border-[var(--accent)] transition-colors">
            <div>
              <p className="text-xs text-[var(--muted)]">متابعة القراءة</p>
              <p className="text-lg font-bold">سورة {lastRead.surah} - آية {lastRead.ayah}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-[var(--muted)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Card>
        </Link>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-[var(--accent)]">{wirdStreak}</p>
          <p className="text-[10px] text-[var(--muted)] mt-1">أيام متتالية</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-[var(--accent)]">{todayStats?.pagesRead || 0}</p>
          <p className="text-[10px] text-[var(--muted)] mt-1">صفحات اليوم</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-[var(--accent)]">{totalKhatm}</p>
          <p className="text-[10px] text-[var(--muted)] mt-1">ختمات</p>
        </Card>
      </div>

      {/* Tarawih Progress (if plan exists) */}
      {tarawihPlan && (
        <Card className="flex items-center gap-4">
          <ProgressRing progress={tarawihProgress} size={80} strokeWidth={6}>
            <span className="text-sm font-bold">{tarawihProgress}%</span>
          </ProgressRing>
          <div className="flex-1">
            <p className="font-bold">ختمة التراويح</p>
            <p className="text-sm text-[var(--muted)]">
              {tarawihPlan.completedNights.length} من {tarawihPlan.totalNights} ليلة
            </p>
            <Link href="/tarawih/tonight" className="text-sm text-[var(--accent)] font-medium mt-1 inline-block">
              قراءة الليلة ←
            </Link>
          </div>
        </Card>
      )}

      {/* Quick Links Grid */}
      <div>
        <h2 className="text-lg font-bold mb-3">الأقسام</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className={`bg-gradient-to-br ${link.color} rounded-2xl p-3 text-center text-white aspect-square flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform`}>
                <span className="text-2xl">{link.icon}</span>
                <span className="text-[10px] font-medium">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* More Links */}
      <div className="space-y-2">
        <Link href="/stats">
          <Card className="flex items-center justify-between hover:border-[var(--accent)] transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span className="font-medium">إحصائيات القراءة</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[var(--muted)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Card>
        </Link>
        <Link href="/khatm">
          <Card className="flex items-center justify-between hover:border-[var(--accent)] transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">👥</span>
              <span className="font-medium">ختمة جماعية</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[var(--muted)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Card>
        </Link>
        <Link href="/connections">
          <Card className="flex items-center justify-between hover:border-[var(--accent)] transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔗</span>
              <span className="font-medium">روابط القرآن</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[var(--muted)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Card>
        </Link>
      </div>
    </div>
  );
}
