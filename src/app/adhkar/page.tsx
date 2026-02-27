"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";

const categories = [
  { id: "morning", name: "أذكار الصباح", icon: "🌅", desc: "تقال بعد صلاة الفجر", count: 27 },
  { id: "evening", name: "أذكار المساء", icon: "🌇", desc: "تقال بعد صلاة العصر", count: 27 },
  { id: "post-salah", name: "أذكار بعد الصلاة", icon: "🕌", desc: "تقال بعد كل صلاة", count: 12 },
  { id: "sleep", name: "أذكار النوم", icon: "🌙", desc: "تقال قبل النوم", count: 15 },
  { id: "wakeup", name: "أذكار الاستيقاظ", icon: "⭐", desc: "تقال عند الاستيقاظ", count: 8 },
  { id: "quran-dua", name: "أدعية من القرآن", icon: "📖", desc: "أدعية مختارة من القرآن الكريم", count: 20 },
  { id: "sunnah-dua", name: "أدعية من السنة", icon: "💚", desc: "أدعية مختارة من السنة النبوية", count: 25 },
  { id: "tasbih", name: "التسبيح", icon: "📿", desc: "سبحان الله والحمد لله", count: 5 },
];

export default function AdhkarPage() {
  return (
    <div className="max-w-lg mx-auto">
      <Header title="الأذكار والأدعية" />
      <div className="px-4 py-6 space-y-3">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/adhkar/${cat.id}`}>
            <Card className="flex items-center gap-4 hover:border-[var(--accent)] transition-colors mb-3">
              <span className="text-3xl">{cat.icon}</span>
              <div className="flex-1">
                <p className="font-bold">{cat.name}</p>
                <p className="text-xs text-[var(--muted)]">{cat.desc}</p>
              </div>
              <span className="text-xs text-[var(--muted)] bg-[var(--card-border)] px-2 py-1 rounded-full">{cat.count}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
