"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";

// Sample adhkar data (in real app, loaded from JSON)
const adhkarData: Record<string, { title: string; items: { text: string; count: number; reference?: string }[] }> = {
  morning: {
    title: "أذكار الصباح",
    items: [
      { text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, reference: "مسلم" },
      { text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", count: 1, reference: "الترمذي" },
      { text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", count: 1, reference: "البخاري" },
      { text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ", count: 100, reference: "مسلم" },
      { text: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 10, reference: "متفق عليه" },
      { text: "أَسْتَغْفِرُ اللهَ وَأَتُوبُ إِلَيْهِ", count: 100, reference: "متفق عليه" },
    ],
  },
  evening: {
    title: "أذكار المساء",
    items: [
      { text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1, reference: "مسلم" },
      { text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ", count: 1, reference: "الترمذي" },
      { text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ", count: 100, reference: "مسلم" },
      { text: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", count: 3, reference: "مسلم" },
    ],
  },
  "post-salah": {
    title: "أذكار بعد الصلاة",
    items: [
      { text: "أَسْتَغْفِرُ اللهَ، أَسْتَغْفِرُ اللهَ، أَسْتَغْفِرُ اللهَ", count: 3 },
      { text: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", count: 1, reference: "مسلم" },
      { text: "سُبْحَانَ اللهِ", count: 33 },
      { text: "الْحَمْدُ لِلَّهِ", count: 33 },
      { text: "اللهُ أَكْبَرُ", count: 33 },
      { text: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1 },
    ],
  },
  tasbih: {
    title: "التسبيح",
    items: [
      { text: "سُبْحَانَ اللهِ", count: 33 },
      { text: "الْحَمْدُ لِلَّهِ", count: 33 },
      { text: "اللهُ أَكْبَرُ", count: 34 },
      { text: "لَا إِلَهَ إِلَّا اللهُ", count: 100 },
      { text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ", count: 100 },
    ],
  },
};

// Default data for categories not explicitly listed
const defaultCategory = {
  title: "الأذكار",
  items: [
    { text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيمِ", count: 100, reference: "متفق عليه" },
  ],
};

export default function AdhkarCategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const category = adhkarData[categoryId] || { ...defaultCategory, title: categoryId };
  const [counters, setCounters] = useState<Record<number, number>>({});

  const handleCount = (index: number, maxCount: number) => {
    setCounters((prev) => {
      const current = prev[index] || 0;
      if (current >= maxCount) return prev;
      return { ...prev, [index]: current + 1 };
    });
  };

  const resetCounter = (index: number) => {
    setCounters((prev) => ({ ...prev, [index]: 0 }));
  };

  return (
    <div className="max-w-lg mx-auto">
      <Header title={category.title} showBack />
      <div className="px-4 py-6 space-y-4">
        {category.items.map((item, i) => {
          const current = counters[i] || 0;
          const completed = current >= item.count;
          return (
            <Card
              key={i}
              onClick={() => handleCount(i, item.count)}
              className={`transition-all ${completed ? "opacity-50 border-primary-500" : "active:scale-[0.98]"}`}
            >
              <p className="quran-text text-lg leading-[2] mb-3">{item.text}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.reference && (
                    <span className="text-[10px] text-[var(--muted)] bg-[var(--card-border)] px-2 py-0.5 rounded-full">
                      {item.reference}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); resetCounter(i); }}
                    className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    ↺
                  </button>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    completed ? "bg-primary-600 text-white" : "bg-[var(--card-border)]"
                  }`}>
                    {current}/{item.count}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
