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
  // Use Intl.DateTimeFormat for Hijri calendar
  const formatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  const parts = formatter.formatToParts(date);
  const day = parseInt(parts.find((p) => p.type === "day")?.value || "1");
  const month = parseInt(parts.find((p) => p.type === "month")?.value || "1");
  const year = parseInt(parts.find((p) => p.type === "year")?.value || "1446");

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
