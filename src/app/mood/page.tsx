"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";

interface MoodCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  ayahs: { surah: string; ayahNum: string; text: string }[];
}

const moods: MoodCategory[] = [
  {
    id: "sad",
    label: "حزين",
    icon: "😢",
    color: "from-blue-600 to-blue-800",
    ayahs: [
      { surah: "الشرح", ayahNum: "5-6", text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا" },
      { surah: "البقرة", ayahNum: "153", text: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ" },
      { surah: "الزمر", ayahNum: "53", text: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا" },
    ],
  },
  {
    id: "anxious",
    label: "قلق",
    icon: "😰",
    color: "from-amber-600 to-amber-800",
    ayahs: [
      { surah: "الرعد", ayahNum: "28", text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ" },
      { surah: "الطلاق", ayahNum: "3", text: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ" },
      { surah: "البقرة", ayahNum: "286", text: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا" },
    ],
  },
  {
    id: "grateful",
    label: "شاكر",
    icon: "🤲",
    color: "from-emerald-600 to-emerald-800",
    ayahs: [
      { surah: "إبراهيم", ayahNum: "7", text: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ" },
      { surah: "النحل", ayahNum: "18", text: "وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا ۗ إِنَّ اللَّهَ لَغَفُورٌ رَّحِيمٌ" },
      { surah: "لقمان", ayahNum: "12", text: "وَمَن يَشْكُرْ فَإِنَّمَا يَشْكُرُ لِنَفْسِهِ" },
    ],
  },
  {
    id: "strength",
    label: "أحتاج قوة",
    icon: "💪",
    color: "from-red-600 to-red-800",
    ayahs: [
      { surah: "آل عمران", ayahNum: "139", text: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ" },
      { surah: "البقرة", ayahNum: "45", text: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ" },
      { surah: "الأنفال", ayahNum: "46", text: "وَاصْبِرُوا ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ" },
    ],
  },
  {
    id: "fear",
    label: "خائف",
    icon: "😨",
    color: "from-purple-600 to-purple-800",
    ayahs: [
      { surah: "آل عمران", ayahNum: "173", text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ" },
      { surah: "التوبة", ayahNum: "51", text: "قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا هُوَ مَوْلَانَا ۚ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ" },
      { surah: "البقرة", ayahNum: "152", text: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ" },
    ],
  },
  {
    id: "hopeful",
    label: "متفائل",
    icon: "🌟",
    color: "from-teal-600 to-teal-800",
    ayahs: [
      { surah: "يوسف", ayahNum: "87", text: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ ۖ إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ" },
      { surah: "الضحى", ayahNum: "4-5", text: "وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ ۝ وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ" },
      { surah: "البقرة", ayahNum: "216", text: "وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ" },
    ],
  },
];

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const currentMood = moods.find((m) => m.id === selectedMood);

  return (
    <div className="max-w-lg mx-auto">
      <Header title="القرآن حسب حالتك" showBack />
      <div className="px-4 py-6 space-y-6">
        {!selectedMood ? (
          <>
            <div className="text-center py-4">
              <h2 className="text-xl font-bold">كيف تشعر الآن؟</h2>
              <p className="text-sm text-[var(--muted)] mt-2">اختر حالتك وسنعرض لك آيات مناسبة</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`bg-gradient-to-br ${mood.color} rounded-2xl p-5 text-white text-center active:scale-95 transition-transform`}
                >
                  <span className="text-4xl block mb-2">{mood.icon}</span>
                  <span className="font-bold">{mood.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedMood(null)}
              className="text-sm text-[var(--accent)] mb-4"
            >
              ← اختيار حالة أخرى
            </button>

            <div className="text-center py-2">
              <span className="text-5xl">{currentMood?.icon}</span>
              <h2 className="text-xl font-bold mt-3">{currentMood?.label}</h2>
              <p className="text-sm text-[var(--muted)] mt-1">آيات تناسب حالتك</p>
            </div>

            <div className="space-y-4">
              {currentMood?.ayahs.map((ayah, i) => (
                <Card key={i} className="space-y-3">
                  <p className="quran-text text-xl leading-[2.2] text-center">{ayah.text}</p>
                  <div className="text-center">
                    <span className="text-xs text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full">
                      سورة {ayah.surah} - آية {ayah.ayahNum}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
