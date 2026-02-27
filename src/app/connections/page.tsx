"use client";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";

const topics = [
  {
    name: "التوحيد",
    color: "bg-emerald-500",
    ayahs: [
      { ref: "الإخلاص ١-٤", text: "قُلْ هُوَ اللَّهُ أَحَدٌ" },
      { ref: "البقرة ٢٥٥", text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ" },
      { ref: "الحشر ٢٢-٢٤", text: "هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ" },
    ]
  },
  {
    name: "الصبر",
    color: "bg-blue-500",
    ayahs: [
      { ref: "البقرة ١٥٣", text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ" },
      { ref: "الزمر ١٠", text: "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ" },
      { ref: "آل عمران ٢٠٠", text: "اصْبِرُوا وَصَابِرُوا وَرَابِطُوا" },
    ]
  },
  {
    name: "الرحمة",
    color: "bg-pink-500",
    ayahs: [
      { ref: "الأنبياء ١٠٧", text: "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ" },
      { ref: "الأعراف ١٥٦", text: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ" },
      { ref: "الزمر ٥٣", text: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ" },
    ]
  },
  {
    name: "التوكل",
    color: "bg-amber-500",
    ayahs: [
      { ref: "الطلاق ٣", text: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ" },
      { ref: "آل عمران ١٥٩", text: "فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ" },
      { ref: "إبراهيم ١٢", text: "وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ" },
    ]
  },
];

export default function ConnectionsPage() {
  return (
    <div className="max-w-lg mx-auto">
      <Header title="روابط القرآن" showBack />
      <div className="px-4 py-6 space-y-6">
        <div className="text-center py-4">
          <h2 className="text-xl font-bold">مواضيع القرآن المترابطة</h2>
          <p className="text-sm text-[var(--muted)] mt-2">
            اكتشف كيف تتصل الآيات عبر السور المختلفة
          </p>
        </div>

        {topics.map((topic) => (
          <Card key={topic.name}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${topic.color}`} />
              <p className="font-bold text-lg">{topic.name}</p>
            </div>
            <div className="space-y-3">
              {topic.ayahs.map((ayah, i) => (
                <div key={i} className="pr-4 border-r-2 border-[var(--card-border)]">
                  <p className="quran-text text-base leading-[2]">{ayah.text}</p>
                  <p className="text-xs text-primary-500 mt-1">{ayah.ref}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
