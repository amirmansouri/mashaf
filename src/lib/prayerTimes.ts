import { Coordinates, CalculationMethod, CalculationParameters, PrayerTimes, SunnahTimes } from "adhan";

export interface PrayerTimeResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  lastThirdOfNight: Date;
}

export function calculatePrayerTimes(
  lat: number,
  lng: number,
  date: Date = new Date(),
  method: string = "MWL"
): PrayerTimeResult {
  const coordinates = new Coordinates(lat, lng);

  const methodMap: Record<string, () => CalculationParameters> = {
    MWL: () => CalculationMethod.MuslimWorldLeague(),
    Egyptian: () => CalculationMethod.Egyptian(),
    Karachi: () => CalculationMethod.Karachi(),
    UmmAlQura: () => CalculationMethod.UmmAlQura(),
    Dubai: () => CalculationMethod.Dubai(),
    Qatar: () => CalculationMethod.Qatar(),
    Kuwait: () => CalculationMethod.Kuwait(),
    Singapore: () => CalculationMethod.Singapore(),
    Tehran: () => CalculationMethod.Tehran(),
    NorthAmerica: () => CalculationMethod.NorthAmerica(),
  };

  const params = (methodMap[method] || methodMap.MWL)();
  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const sunnahTimes = new SunnahTimes(prayerTimes);

  return {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    lastThirdOfNight: sunnahTimes.lastThirdOfTheNight,
  };
}

export function getNextPrayer(times: PrayerTimeResult): { name: string; time: Date } | null {
  const now = new Date();
  const prayers = [
    { name: "الفجر", time: times.fajr },
    { name: "الشروق", time: times.sunrise },
    { name: "الظهر", time: times.dhuhr },
    { name: "العصر", time: times.asr },
    { name: "المغرب", time: times.maghrib },
    { name: "العشاء", time: times.isha },
  ];

  for (const prayer of prayers) {
    if (prayer.time > now) return prayer;
  }
  return null;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getTimeUntil(target: Date): { hours: number; minutes: number; seconds: number } {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}
