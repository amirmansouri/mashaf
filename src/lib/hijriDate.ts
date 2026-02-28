// Simple Hijri date conversion (Umm Al-Qura approximation)
export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

const hijriMonths = [
  "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
];

export function toHijri(date: Date = new Date()): HijriDate {
  try {
    // Use Intl.DateTimeFormat with English numerals
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

    const parts = formatter.formatToParts(date);
    const dayStr = parts.find((p) => p.type === "day")?.value || "";
    const monthStr = parts.find((p) => p.type === "month")?.value || "";
    const yearStr = parts.find((p) => p.type === "year")?.value || "";

    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return fallbackHijri(date);
    }

    return {
      day,
      month,
      year,
      monthName: hijriMonths[month - 1] || "",
    };
  } catch {
    return fallbackHijri(date);
  }
}

// Fallback calculation if Intl is not available
function fallbackHijri(date: Date): HijriDate {
  const g = date.getTime() / 86400000 + 2440587.5;
  const z = Math.floor(g - 1948439.5) + 1;
  const a = Math.floor((z - 1) / 10631);
  const b = (z - 1) - 10631 * a;
  const c = Math.floor((b - 1) / 354.36667);
  const d = b - Math.floor(c * 354.36667);
  const month = Math.min(12, Math.ceil((d - 0.5) / 29.5));
  const day = Math.max(1, d - Math.floor(29.5001 * (month - 1)));
  const year = 30 * a + c + 1;

  return {
    day,
    month,
    year,
    monthName: hijriMonths[month - 1] || "",
  };
}

export function formatHijri(hijri: HijriDate): string {
  return `${hijri.day} ${hijri.monthName} ${hijri.year} هـ`;
}

export function isRamadan(date: Date = new Date()): boolean {
  return toHijri(date).month === 9;
}

export function getRamadanDay(date: Date = new Date()): number | null {
  const hijri = toHijri(date);
  if (hijri.month !== 9) return null;
  return hijri.day;
}

export function getDaysUntilRamadan(): number | null {
  const today = new Date();
  const hijri = toHijri(today);
  if (hijri.month === 9) return 0;
  // Approximate: check next 365 days
  for (let i = 1; i <= 365; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + i);
    if (toHijri(futureDate).month === 9) return i;
  }
  return null;
}
