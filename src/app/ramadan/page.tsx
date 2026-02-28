"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useSettingsStore } from "@/stores/settingsStore";
import { toHijri, formatHijri, isRamadan, getRamadanDay, getDaysUntilRamadan } from "@/lib/hijriDate";
import { calculatePrayerTimes, getTimeUntil } from "@/lib/prayerTimes";

export default function RamadanPage() {
  const location = useSettingsStore((s) => s.location);
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const ramadanDay = getRamadanDay();
  const inRamadan = isRamadan();
  const daysUntil = getDaysUntilRamadan();
  const hijri = formatHijri(toHijri());

  useEffect(() => {
    if (!location || !inRamadan) return;
    const update = () => {
      const times = calculatePrayerTimes(location.lat, location.lng);
      const now = new Date();
      const target = now < times.maghrib ? times.maghrib : times.fajr;
      const label = now < times.maghrib ? "الإفطار" : "السحور";
      const until = getTimeUntil(target);
      setCountdown(`${label} بعد ${until.hours}:${String(until.minutes).padStart(2, "0")}:${String(until.seconds).padStart(2, "0")}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [location, inRamadan]);

  if (!mounted) return null;

  return (
    <div className="max-w-lg mx-auto">
      <Header title="رمضان" showBack />
      <div className="px-4 py-6 space-y-6">
        {inRamadan ? (
          <>
            <Card gradient="primary" className="text-center">
              <p className="text-sm opacity-80">رمضان كريم</p>
              <p className="text-3xl font-bold mt-2">اليوم {ramadanDay}</p>
              <p className="text-sm mt-2 opacity-80">{hijri}</p>
              {countdown && <p className="text-lg font-mono font-bold mt-3">{countdown}</p>}
              {ramadanDay && (
                <div className="mt-4">
                  <ProgressBar progress={(ramadanDay / 30) * 100} showLabel />
                </div>
              )}
            </Card>

            {/* Fasting Dua */}
            <Card>
              <p className="text-sm font-bold mb-2">دعاء الإفطار</p>
              <p className="quran-text text-lg leading-[2]">
                ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ
              </p>
            </Card>

            {/* Last 10 Nights */}
            {ramadanDay && ramadanDay >= 21 && (
              <Card gradient="gold" className="text-center">
                <p className="text-sm opacity-80">العشر الأواخر</p>
                <p className="text-xl font-bold mt-1">ليلة القدر خير من ألف شهر</p>
                <p className="quran-text text-base mt-3 opacity-90">
                  اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي
                </p>
              </Card>
            )}
          </>
        ) : (
          <Card className="text-center py-8">
            <span className="text-6xl">🌙</span>
            <h2 className="text-xl font-bold mt-4">
              {daysUntil !== null ? `${daysUntil} يوم حتى رمضان` : "رمضان قادم قريباً"}
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2">{hijri}</p>
          </Card>
        )}

        {/* Links */}
        <Link href="/ramadan/hizb-calculator">
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">📖</span>
              <div>
                <p className="font-bold">حاسبة موضع الحزب</p>
                <p className="text-xs text-[var(--muted)]">اعرف وين وصلت بالقراءة</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-[var(--muted)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Card>
        </Link>

        <Link href="/ramadan/zakat">
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">💰</span>
              <div>
                <p className="font-bold">حاسبة الزكاة</p>
                <p className="text-xs text-[var(--muted)]">احسب زكاة المال والذهب</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-[var(--muted)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Card>
        </Link>

        <Link href="/tarawih">
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🕌</span>
              <div>
                <p className="font-bold">خطة التراويح</p>
                <p className="text-xs text-[var(--muted)]">خطط لختمة القرآن في رمضان</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-[var(--muted)]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Card>
        </Link>
      </div>
    </div>
  );
}
