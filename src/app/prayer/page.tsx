"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/stores/settingsStore";
import { calculatePrayerTimes, getNextPrayer, formatTime, getTimeUntil, PrayerTimeResult } from "@/lib/prayerTimes";

export default function PrayerPage() {
  const { location, setLocation, prayerMethod } = useSettingsStore();
  const [times, setTimes] = useState<PrayerTimeResult | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: Date } | null>(null);
  const [countdown, setCountdown] = useState("--:--:--");
  const [locating, setLocating] = useState(false);

  const requestLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          city: "موقعك الحالي",
        });
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  useEffect(() => {
    if (!location) return;
    const t = calculatePrayerTimes(location.lat, location.lng, new Date(), prayerMethod);
    setTimes(t);
    setNextPrayer(getNextPrayer(t));
  }, [location, prayerMethod]);

  useEffect(() => {
    if (!nextPrayer) return;
    const interval = setInterval(() => {
      const until = getTimeUntil(nextPrayer.time);
      setCountdown(`${until.hours}:${String(until.minutes).padStart(2, "0")}:${String(until.seconds).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer]);

  const prayers = times ? [
    { name: "الفجر", time: times.fajr, icon: "🌅" },
    { name: "الشروق", time: times.sunrise, icon: "☀️" },
    { name: "الظهر", time: times.dhuhr, icon: "🌤️" },
    { name: "العصر", time: times.asr, icon: "⛅" },
    { name: "المغرب", time: times.maghrib, icon: "🌇" },
    { name: "العشاء", time: times.isha, icon: "🌙" },
  ] : [];

  return (
    <div className="max-w-lg mx-auto">
      <Header title="أوقات الصلاة" />
      <div className="px-4 py-6 space-y-6">
        {!location ? (
          <div className="text-center py-12">
            <span className="text-6xl">🕌</span>
            <h2 className="text-xl font-bold mt-4">أوقات الصلاة</h2>
            <p className="text-sm text-[var(--muted)] mt-2">نحتاج موقعك لحساب أوقات الصلاة بدقة</p>
            <Button className="mt-6" onClick={requestLocation} disabled={locating}>
              {locating ? "جارٍ تحديد الموقع..." : "تحديد الموقع 📍"}
            </Button>
          </div>
        ) : (
          <>
            {/* Next Prayer Card */}
            {nextPrayer && (
              <Card gradient="primary" className="text-center">
                <p className="text-sm opacity-80">الصلاة القادمة</p>
                <p className="text-2xl font-bold mt-1">{nextPrayer.name}</p>
                <p className="text-4xl font-mono font-bold mt-2" dir="ltr">{countdown}</p>
                <p className="text-sm mt-2 opacity-80">{formatTime(nextPrayer.time)}</p>
              </Card>
            )}

            {/* All Prayer Times */}
            <div className="space-y-2">
              {prayers.map((prayer) => {
                const isNext = nextPrayer?.name === prayer.name;
                return (
                  <Card key={prayer.name} className={`flex items-center justify-between ${isNext ? "border-[var(--accent)]" : ""}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{prayer.icon}</span>
                      <p className={`font-medium ${isNext ? "text-[var(--accent)]" : ""}`}>{prayer.name}</p>
                    </div>
                    <p className={`font-mono text-sm ${isNext ? "text-[var(--accent)] font-bold" : "text-[var(--muted)]"}`}>
                      {formatTime(prayer.time)}
                    </p>
                  </Card>
                );
              })}
            </div>

            {/* Qibla Link */}
            <Link href="/prayer/qibla">
              <Card className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🧭</span>
                  <div>
                    <p className="font-bold">اتجاه القبلة</p>
                    <p className="text-xs text-[var(--muted)]">بوصلة القبلة</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-[var(--muted)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </Card>
            </Link>

            {/* Location Info */}
            <p className="text-center text-xs text-[var(--muted)]">
              {location.city} • {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
            </p>
            <Button variant="ghost" fullWidth onClick={requestLocation} className="text-xs">
              تحديث الموقع
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
