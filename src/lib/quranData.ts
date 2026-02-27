export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  juz: number;
  page: number;
  hizbQuarter: number;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export interface QuranData {
  surahs: Surah[];
}

let cachedQuran: QuranData | null = null;

export async function loadQuranData(): Promise<QuranData> {
  if (cachedQuran) return cachedQuran;
  const res = await fetch("/data/quran.json");
  cachedQuran = await res.json();
  return cachedQuran!;
}

export async function getSurah(number: number): Promise<Surah | undefined> {
  const data = await loadQuranData();
  return data.surahs.find((s) => s.number === number);
}

export async function getJuzAyahs(juz: number): Promise<{ surah: Surah; ayahs: Ayah[] }[]> {
  const data = await loadQuranData();
  const result: { surah: Surah; ayahs: Ayah[] }[] = [];
  for (const surah of data.surahs) {
    const juzAyahs = surah.ayahs.filter((a) => a.juz === juz);
    if (juzAyahs.length > 0) {
      result.push({ surah, ayahs: juzAyahs });
    }
  }
  return result;
}

export async function searchQuran(query: string): Promise<{ surah: Surah; ayah: Ayah }[]> {
  const data = await loadQuranData();
  const results: { surah: Surah; ayah: Ayah }[] = [];
  const normalizedQuery = query.replace(/[ًٌٍَُِّْ]/g, ""); // Remove tashkeel
  for (const surah of data.surahs) {
    for (const ayah of surah.ayahs) {
      const normalizedText = ayah.text.replace(/[ًٌٍَُِّْ]/g, "");
      if (normalizedText.includes(normalizedQuery)) {
        results.push({ surah, ayah });
      }
    }
  }
  return results;
}

// Surah metadata for quick access without loading full data
export const surahNames = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatiha", ayahs: 7, type: "مكية" },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", ayahs: 286, type: "مدنية" },
  { number: 3, name: "آل عمران", englishName: "Ali 'Imran", ayahs: 200, type: "مدنية" },
  { number: 4, name: "النساء", englishName: "An-Nisa", ayahs: 176, type: "مدنية" },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", ayahs: 120, type: "مدنية" },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", ayahs: 165, type: "مكية" },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", ayahs: 206, type: "مكية" },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", ayahs: 75, type: "مدنية" },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", ayahs: 129, type: "مدنية" },
  { number: 10, name: "يونس", englishName: "Yunus", ayahs: 109, type: "مكية" },
  { number: 11, name: "هود", englishName: "Hud", ayahs: 123, type: "مكية" },
  { number: 12, name: "يوسف", englishName: "Yusuf", ayahs: 111, type: "مكية" },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", ayahs: 43, type: "مدنية" },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", ayahs: 52, type: "مكية" },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", ayahs: 99, type: "مكية" },
  { number: 16, name: "النحل", englishName: "An-Nahl", ayahs: 128, type: "مكية" },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", ayahs: 111, type: "مكية" },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", ayahs: 110, type: "مكية" },
  { number: 19, name: "مريم", englishName: "Maryam", ayahs: 98, type: "مكية" },
  { number: 20, name: "طه", englishName: "Taha", ayahs: 135, type: "مكية" },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiya", ayahs: 112, type: "مكية" },
  { number: 22, name: "الحج", englishName: "Al-Hajj", ayahs: 78, type: "مدنية" },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", ayahs: 118, type: "مكية" },
  { number: 24, name: "النور", englishName: "An-Nur", ayahs: 64, type: "مدنية" },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", ayahs: 77, type: "مكية" },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", ayahs: 227, type: "مكية" },
  { number: 27, name: "النمل", englishName: "An-Naml", ayahs: 93, type: "مكية" },
  { number: 28, name: "القصص", englishName: "Al-Qasas", ayahs: 88, type: "مكية" },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankabut", ayahs: 69, type: "مكية" },
  { number: 30, name: "الروم", englishName: "Ar-Rum", ayahs: 60, type: "مكية" },
  { number: 31, name: "لقمان", englishName: "Luqman", ayahs: 34, type: "مكية" },
  { number: 32, name: "السجدة", englishName: "As-Sajdah", ayahs: 30, type: "مكية" },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab", ayahs: 73, type: "مدنية" },
  { number: 34, name: "سبأ", englishName: "Saba", ayahs: 54, type: "مكية" },
  { number: 35, name: "فاطر", englishName: "Fatir", ayahs: 45, type: "مكية" },
  { number: 36, name: "يس", englishName: "Ya-Sin", ayahs: 83, type: "مكية" },
  { number: 37, name: "الصافات", englishName: "As-Saffat", ayahs: 182, type: "مكية" },
  { number: 38, name: "ص", englishName: "Sad", ayahs: 88, type: "مكية" },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", ayahs: 75, type: "مكية" },
  { number: 40, name: "غافر", englishName: "Ghafir", ayahs: 85, type: "مكية" },
  { number: 41, name: "فصلت", englishName: "Fussilat", ayahs: 54, type: "مكية" },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", ayahs: 53, type: "مكية" },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", ayahs: 89, type: "مكية" },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan", ayahs: 59, type: "مكية" },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiyah", ayahs: 37, type: "مكية" },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", ayahs: 35, type: "مكية" },
  { number: 47, name: "محمد", englishName: "Muhammad", ayahs: 38, type: "مدنية" },
  { number: 48, name: "الفتح", englishName: "Al-Fath", ayahs: 29, type: "مدنية" },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat", ayahs: 18, type: "مدنية" },
  { number: 50, name: "ق", englishName: "Qaf", ayahs: 45, type: "مكية" },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat", ayahs: 60, type: "مكية" },
  { number: 52, name: "الطور", englishName: "At-Tur", ayahs: 49, type: "مكية" },
  { number: 53, name: "النجم", englishName: "An-Najm", ayahs: 62, type: "مكية" },
  { number: 54, name: "القمر", englishName: "Al-Qamar", ayahs: 55, type: "مكية" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", ayahs: 78, type: "مدنية" },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah", ayahs: 96, type: "مكية" },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", ayahs: 29, type: "مدنية" },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadilah", ayahs: 22, type: "مدنية" },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", ayahs: 24, type: "مدنية" },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", ayahs: 13, type: "مدنية" },
  { number: 61, name: "الصف", englishName: "As-Saf", ayahs: 14, type: "مدنية" },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'ah", ayahs: 11, type: "مدنية" },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun", ayahs: 11, type: "مدنية" },
  { number: 64, name: "التغابن", englishName: "At-Taghabun", ayahs: 18, type: "مدنية" },
  { number: 65, name: "الطلاق", englishName: "At-Talaq", ayahs: 12, type: "مدنية" },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", ayahs: 12, type: "مدنية" },
  { number: 67, name: "الملك", englishName: "Al-Mulk", ayahs: 30, type: "مكية" },
  { number: 68, name: "القلم", englishName: "Al-Qalam", ayahs: 52, type: "مكية" },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqah", ayahs: 52, type: "مكية" },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij", ayahs: 44, type: "مكية" },
  { number: 71, name: "نوح", englishName: "Nuh", ayahs: 28, type: "مكية" },
  { number: 72, name: "الجن", englishName: "Al-Jinn", ayahs: 28, type: "مكية" },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", ayahs: 20, type: "مكية" },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", ayahs: 56, type: "مكية" },
  { number: 75, name: "القيامة", englishName: "Al-Qiyamah", ayahs: 40, type: "مكية" },
  { number: 76, name: "الإنسان", englishName: "Al-Insan", ayahs: 31, type: "مدنية" },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat", ayahs: 50, type: "مكية" },
  { number: 78, name: "النبأ", englishName: "An-Naba", ayahs: 40, type: "مكية" },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at", ayahs: 46, type: "مكية" },
  { number: 80, name: "عبس", englishName: "Abasa", ayahs: 42, type: "مكية" },
  { number: 81, name: "التكوير", englishName: "At-Takwir", ayahs: 29, type: "مكية" },
  { number: 82, name: "الانفطار", englishName: "Al-Infitar", ayahs: 19, type: "مكية" },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", ayahs: 36, type: "مكية" },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", ayahs: 25, type: "مكية" },
  { number: 85, name: "البروج", englishName: "Al-Buruj", ayahs: 22, type: "مكية" },
  { number: 86, name: "الطارق", englishName: "At-Tariq", ayahs: 17, type: "مكية" },
  { number: 87, name: "الأعلى", englishName: "Al-A'la", ayahs: 19, type: "مكية" },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah", ayahs: 26, type: "مكية" },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", ayahs: 30, type: "مكية" },
  { number: 90, name: "البلد", englishName: "Al-Balad", ayahs: 20, type: "مكية" },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", ayahs: 15, type: "مكية" },
  { number: 92, name: "الليل", englishName: "Al-Layl", ayahs: 21, type: "مكية" },
  { number: 93, name: "الضحى", englishName: "Ad-Duha", ayahs: 11, type: "مكية" },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", ayahs: 8, type: "مكية" },
  { number: 95, name: "التين", englishName: "At-Tin", ayahs: 8, type: "مكية" },
  { number: 96, name: "العلق", englishName: "Al-Alaq", ayahs: 19, type: "مكية" },
  { number: 97, name: "القدر", englishName: "Al-Qadr", ayahs: 5, type: "مكية" },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah", ayahs: 8, type: "مدنية" },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah", ayahs: 8, type: "مدنية" },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat", ayahs: 11, type: "مكية" },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah", ayahs: 11, type: "مكية" },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", ayahs: 8, type: "مكية" },
  { number: 103, name: "العصر", englishName: "Al-Asr", ayahs: 3, type: "مكية" },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah", ayahs: 9, type: "مكية" },
  { number: 105, name: "الفيل", englishName: "Al-Fil", ayahs: 5, type: "مكية" },
  { number: 106, name: "قريش", englishName: "Quraysh", ayahs: 4, type: "مكية" },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", ayahs: 7, type: "مكية" },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", ayahs: 3, type: "مكية" },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", ayahs: 6, type: "مكية" },
  { number: 110, name: "النصر", englishName: "An-Nasr", ayahs: 3, type: "مدنية" },
  { number: 111, name: "المسد", englishName: "Al-Masad", ayahs: 5, type: "مكية" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", ayahs: 4, type: "مكية" },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", ayahs: 5, type: "مكية" },
  { number: 114, name: "الناس", englishName: "An-Nas", ayahs: 6, type: "مكية" },
];
