// Clean, high-performance Quran data service using official open APIs
// Endpoints:
// - Surah-wise: https://api.alquran.cloud/v1/surah/{SURAH_NUMBER}/editions/quran-uthmani,ur.jalandhry,ar.alafasy
// - Para-wise: https://api.alquran.cloud/v1/juz/{JUZ_NUMBER}/editions/quran-uthmani,ur.jalandhry,ar.alafasy
// - EveryAyah repository fallback: https://everyayah.com/data/Alafasy_128kbps/{SurahNumber}{AyahNumber}.mp3

export interface Ayah {
  number: number; // Absolute ayah number in Quran (1 - 6236)
  numberInSurah: number;
  text: string; // Authentic Uthmani Arabic script
  urduText: string; // Authentic Jalandhry Urdu translation
  audioUrl: string; // Primary audio stream
  fallbackAudioUrl: string; // EveryAyah high-quality CDN fallback
  surahNumber: number;
  surahName?: string;
  juz: number;
  page?: number;
}

export interface SurahMeta {
  number: number;
  name: string; // Arabic name with tashkeel
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
  tag?: string;
  tagColor?: string;
}

export interface ParaMeta {
  number: number;
  arabicName: string;
  englishName: string;
  surahsIncluded: string;
  totalVersesApprox: number;
}

// EveryAyah formatted audio url helper
export function getEveryAyahAudioUrl(surah: number, ayahInSurah: number): string {
  const s = String(surah).padStart(3, '0');
  const a = String(ayahInSurah).padStart(3, '0');
  return `https://everyayah.com/data/Alafasy_128kbps/${s}${a}.mp3`;
}

// Complete 114 Surahs catalog with special highlights
export const SURAHS_CATALOG: SurahMeta[] = [
  { number: 1, name: "سُورَةُ ٱلْفَاتِحَةِ", englishName: "Al-Fatihah", englishNameTranslation: "The Opening", revelationType: "Meccan", numberOfAyahs: 7, tag: "Mother of the Book", tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { number: 2, name: "سُورَةُ البَقَرَةِ", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", revelationType: "Medinan", numberOfAyahs: 286, tag: "Contains Ayat-ul-Kursi", tagColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { number: 3, name: "سُورَةُ آلِ عِمْرَانَ", englishName: "Ali 'Imran", englishNameTranslation: "Family of Imran", revelationType: "Medinan", numberOfAyahs: 200 },
  { number: 4, name: "سُورَةُ النِّسَاءِ", englishName: "An-Nisa", englishNameTranslation: "The Women", revelationType: "Medinan", numberOfAyahs: 176 },
  { number: 5, name: "سُورَةُ المَائِدَةِ", englishName: "Al-Ma'idah", englishNameTranslation: "The Table Spread", revelationType: "Medinan", numberOfAyahs: 120 },
  { number: 6, name: "سُورَةُ الأَنْعَامِ", englishName: "Al-An'am", englishNameTranslation: "The Cattle", revelationType: "Meccan", numberOfAyahs: 165 },
  { number: 7, name: "سُورَةُ الأَعْرَافِ", englishName: "Al-A'raf", englishNameTranslation: "The Heights", revelationType: "Meccan", numberOfAyahs: 206 },
  { number: 8, name: "سُورَةُ الأَنْفَالِ", englishName: "Al-Anfal", englishNameTranslation: "The Spoils of War", revelationType: "Medinan", numberOfAyahs: 75 },
  { number: 9, name: "سُورَةُ التَّوْبَةِ", englishName: "At-Tawbah", englishNameTranslation: "The Repentance", revelationType: "Medinan", numberOfAyahs: 129 },
  { number: 10, name: "سُورَةُ يُونُسَ", englishName: "Yunus", englishNameTranslation: "Jonah", revelationType: "Meccan", numberOfAyahs: 109 },
  { number: 11, name: "سُورَةُ هُودٍ", englishName: "Hud", englishNameTranslation: "Hud", revelationType: "Meccan", numberOfAyahs: 123 },
  { number: 12, name: "سُورَةُ يُوسُفَ", englishName: "Yusuf", englishNameTranslation: "Joseph", revelationType: "Meccan", numberOfAyahs: 111, tag: "Best of Stories", tagColor: "bg-teal-50 text-teal-700 border-teal-200" },
  { number: 13, name: "سُورَةُ الرَّعْدِ", englishName: "Ar-Ra'd", englishNameTranslation: "The Thunder", revelationType: "Medinan", numberOfAyahs: 43 },
  { number: 14, name: "سُورَةُ إِبْرَاهِيمَ", englishName: "Ibrahim", englishNameTranslation: "Abraham", revelationType: "Meccan", numberOfAyahs: 52 },
  { number: 15, name: "سُورَةُ الحِجْرِ", englishName: "Al-Hijr", englishNameTranslation: "The Rocky Tract", revelationType: "Meccan", numberOfAyahs: 99 },
  { number: 16, name: "سُورَةُ النَّحْلِ", englishName: "An-Nahl", englishNameTranslation: "The Bee", revelationType: "Meccan", numberOfAyahs: 128 },
  { number: 17, name: "سُورَةُ الإِسْرَاءِ", englishName: "Al-Isra", englishNameTranslation: "The Night Journey", revelationType: "Meccan", numberOfAyahs: 111 },
  { number: 18, name: "سُورَةُ الكَهْفِ", englishName: "Al-Kahf", englishNameTranslation: "The Cave", revelationType: "Meccan", numberOfAyahs: 110, tag: "Friday Sunnah Protection", tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { number: 19, name: "سُورَةُ مَرْيَمَ", englishName: "Maryam", englishNameTranslation: "Mary", revelationType: "Meccan", numberOfAyahs: 98 },
  { number: 20, name: "سُورَةُ طه", englishName: "Ta-Ha", englishNameTranslation: "Ta-Ha", revelationType: "Meccan", numberOfAyahs: 135 },
  { number: 21, name: "سُورَةُ الأَنْبِيَاءِ", englishName: "Al-Anbiya", englishNameTranslation: "The Prophets", revelationType: "Meccan", numberOfAyahs: 112 },
  { number: 22, name: "سُورَةُ الحَجِّ", englishName: "Al-Hajj", englishNameTranslation: "The Pilgrimage", revelationType: "Medinan", numberOfAyahs: 78 },
  { number: 23, name: "سُورَةُ المُؤْمِنُونَ", englishName: "Al-Mu'minun", englishNameTranslation: "The Believers", revelationType: "Meccan", numberOfAyahs: 118 },
  { number: 24, name: "سُورَةُ النُّورِ", englishName: "An-Nur", englishNameTranslation: "The Light", revelationType: "Medinan", numberOfAyahs: 64 },
  { number: 25, name: "سُورَةُ الفُرْقَانِ", englishName: "Al-Furqan", englishNameTranslation: "The Criterion", revelationType: "Meccan", numberOfAyahs: 77 },
  { number: 26, name: "سُورَةُ الشُّعَرَاءِ", englishName: "Ash-Shu'ara", englishNameTranslation: "The Poets", revelationType: "Meccan", numberOfAyahs: 227 },
  { number: 27, name: "سُورَةُ النَّمْلِ", englishName: "An-Naml", englishNameTranslation: "The Ant", revelationType: "Meccan", numberOfAyahs: 93 },
  { number: 28, name: "سُورَةُ القَصَصِ", englishName: "Al-Qasas", englishNameTranslation: "The Stories", revelationType: "Meccan", numberOfAyahs: 88 },
  { number: 29, name: "سُورَةُ العَنْكَبُوتِ", englishName: "Al-'Ankabut", englishNameTranslation: "The Spider", revelationType: "Meccan", numberOfAyahs: 69 },
  { number: 30, name: "سُورَةُ الرُّومِ", englishName: "Ar-Rum", englishNameTranslation: "The Romans", revelationType: "Meccan", numberOfAyahs: 60 },
  { number: 31, name: "سُورَةُ لُقْمَانَ", englishName: "Luqman", englishNameTranslation: "Luqman", revelationType: "Meccan", numberOfAyahs: 34 },
  { number: 32, name: "سُورَةُ السَّجْدَةِ", englishName: "As-Sajdah", englishNameTranslation: "The Prostration", revelationType: "Meccan", numberOfAyahs: 30 },
  { number: 33, name: "سُورَةُ الأَحْزَابِ", englishName: "Al-Ahzab", englishNameTranslation: "The Combined Forces", revelationType: "Medinan", numberOfAyahs: 73 },
  { number: 34, name: "سُورَةُ سَبَإٍ", englishName: "Saba", englishNameTranslation: "Sheba", revelationType: "Meccan", numberOfAyahs: 54 },
  { number: 35, name: "سُورَةُ فَاطِرٍ", englishName: "Fatir", englishNameTranslation: "Originator", revelationType: "Meccan", numberOfAyahs: 45 },
  { number: 36, name: "سُورَةُ يس", englishName: "Ya-Sin", englishNameTranslation: "Yaseen", revelationType: "Meccan", numberOfAyahs: 83, tag: "Heart of the Quran", tagColor: "bg-rose-50 text-rose-700 border-rose-200" },
  { number: 37, name: "سُورَةُ الصَّافَّاتِ", englishName: "As-Saffat", englishNameTranslation: "Those who set the Ranks", revelationType: "Meccan", numberOfAyahs: 182 },
  { number: 38, name: "سُورَةُ ص", englishName: "Sad", englishNameTranslation: "The Letter Sad", revelationType: "Meccan", numberOfAyahs: 88 },
  { number: 39, name: "سُورَةُ الزُّمَرِ", englishName: "Az-Zumar", englishNameTranslation: "The Troops", revelationType: "Meccan", numberOfAyahs: 75 },
  { number: 40, name: "سُورَةُ غَافِرٍ", englishName: "Ghafir", englishNameTranslation: "The Forgiver", revelationType: "Meccan", numberOfAyahs: 85 },
  { number: 41, name: "سُورَةُ فُصِّلَتْ", englishName: "Fussilat", englishNameTranslation: "Explained in Detail", revelationType: "Meccan", numberOfAyahs: 54 },
  { number: 42, name: "سُورَةُ الشُّورَىٰ", englishName: "Ash-Shura", englishNameTranslation: "The Consultation", revelationType: "Meccan", numberOfAyahs: 53 },
  { number: 43, name: "سُورَةُ الزُّخْرُفِ", englishName: "Az-Zukhruf", englishNameTranslation: "The Ornaments of Gold", revelationType: "Meccan", numberOfAyahs: 89 },
  { number: 44, name: "سُورَةُ الدُّخَانِ", englishName: "Ad-Dukhan", englishNameTranslation: "The Smoke", revelationType: "Meccan", numberOfAyahs: 59 },
  { number: 45, name: "سُورَةُ الجَاثِيَةِ", englishName: "Al-Jathiyah", englishNameTranslation: "The Crouching", revelationType: "Meccan", numberOfAyahs: 37 },
  { number: 46, name: "سُورَةُ الأَحْقَافِ", englishName: "Al-Ahqaf", englishNameTranslation: "The Wind-Curved Sandhills", revelationType: "Meccan", numberOfAyahs: 35 },
  { number: 47, name: "سُورَةُ مُحَمَّدٍ", englishName: "Muhammad", englishNameTranslation: "Muhammad", revelationType: "Medinan", numberOfAyahs: 38 },
  { number: 48, name: "سُورَةُ الفَتْحِ", englishName: "Al-Fath", englishNameTranslation: "The Victory", revelationType: "Medinan", numberOfAyahs: 29 },
  { number: 49, name: "سُورَةُ الحُجُرَاتِ", englishName: "Al-Hujurat", englishNameTranslation: "The Rooms", revelationType: "Medinan", numberOfAyahs: 18 },
  { number: 50, name: "سُورَةُ ق", englishName: "Qaf", englishNameTranslation: "The Letter Qaf", revelationType: "Meccan", numberOfAyahs: 45 },
  { number: 51, name: "سُورَةُ الذَّارِيَاتِ", englishName: "Adh-Dhariyat", englishNameTranslation: "The Winnowing Winds", revelationType: "Meccan", numberOfAyahs: 60 },
  { number: 52, name: "سُورَةُ الطُّورِ", englishName: "At-Tur", englishNameTranslation: "The Mount", revelationType: "Meccan", numberOfAyahs: 49 },
  { number: 53, name: "سُورَةُ النَّجْمِ", englishName: "An-Najm", englishNameTranslation: "The Star", revelationType: "Meccan", numberOfAyahs: 62 },
  { number: 54, name: "سُورَةُ القَمَرِ", englishName: "Al-Qamar", englishNameTranslation: "The Moon", revelationType: "Meccan", numberOfAyahs: 55 },
  { number: 55, name: "سُورَةُ الرَّحْمَٰنِ", englishName: "Ar-Rahman", englishNameTranslation: "The Beneficent", revelationType: "Medinan", numberOfAyahs: 78, tag: "Beauty of Quran", tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { number: 56, name: "سُورَةُ الوَاقِعَةِ", englishName: "Al-Waqi'ah", englishNameTranslation: "The Inevitable", revelationType: "Meccan", numberOfAyahs: 96, tag: "Abundance & Rizq", tagColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { number: 57, name: "سُورَةُ الحَدِيدِ", englishName: "Al-Hadid", englishNameTranslation: "The Iron", revelationType: "Medinan", numberOfAyahs: 29 },
  { number: 58, name: "سُورَةُ المُجَادَلَةِ", englishName: "Al-Mujadila", englishNameTranslation: "The Pleading Woman", revelationType: "Medinan", numberOfAyahs: 22 },
  { number: 59, name: "سُورَةُ الحَشْرِ", englishName: "Al-Hashr", englishNameTranslation: "The Exile", revelationType: "Medinan", numberOfAyahs: 24 },
  { number: 60, name: "سُورَةُ المُمْتَحَنَةِ", englishName: "Al-Mumtahanah", englishNameTranslation: "She that is to be examined", revelationType: "Medinan", numberOfAyahs: 13 },
  { number: 61, name: "سُورَةُ الصَّفِّ", englishName: "As-Saff", englishNameTranslation: "The Ranks", revelationType: "Medinan", numberOfAyahs: 14 },
  { number: 62, name: "سُورَةُ الجُمُعَةِ", englishName: "Al-Jumu'ah", englishNameTranslation: "The Congregation", revelationType: "Medinan", numberOfAyahs: 11 },
  { number: 63, name: "سُورَةُ المُنَافِقُونَ", englishName: "Al-Munafiqun", englishNameTranslation: "The Hypocrites", revelationType: "Medinan", numberOfAyahs: 11 },
  { number: 64, name: "سُورَةُ التَّغَابُنِ", englishName: "At-Taghabun", englishNameTranslation: "Mutual Disillusion", revelationType: "Medinan", numberOfAyahs: 18 },
  { number: 65, name: "سُورَةُ الطَّلَاقِ", englishName: "At-Talaq", englishNameTranslation: "The Divorce", revelationType: "Medinan", numberOfAyahs: 12 },
  { number: 66, name: "سُورَةُ التَّحْرِيمِ", englishName: "At-Tahrim", englishNameTranslation: "The Prohibition", revelationType: "Medinan", numberOfAyahs: 12 },
  { number: 67, name: "سُورَةُ المُلْكِ", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", revelationType: "Meccan", numberOfAyahs: 30, tag: "Nightly Protection", tagColor: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { number: 68, name: "سُورَةُ القَلَمِ", englishName: "Al-Qalam", englishNameTranslation: "The Pen", revelationType: "Meccan", numberOfAyahs: 52 },
  { number: 69, name: "سُورَةُ الحَاقَّةِ", englishName: "Al-Haqqah", englishNameTranslation: "The Reality", revelationType: "Meccan", numberOfAyahs: 52 },
  { number: 70, name: "سُورَةُ المَعَارِجِ", englishName: "Al-Ma'arij", englishNameTranslation: "The Ascending Stairways", revelationType: "Meccan", numberOfAyahs: 44 },
  { number: 71, name: "سُورَةُ نُوحٍ", englishName: "Nuh", englishNameTranslation: "Noah", revelationType: "Meccan", numberOfAyahs: 28 },
  { number: 72, name: "سُورَةُ الجِنِّ", englishName: "Al-Jinn", englishNameTranslation: "The Jinn", revelationType: "Meccan", numberOfAyahs: 28 },
  { number: 73, name: "سُورَةُ المُزَّمِّلِ", englishName: "Al-Muzzammil", englishNameTranslation: "The Enshrouded One", revelationType: "Meccan", numberOfAyahs: 20 },
  { number: 74, name: "سُورَةُ المُدَّثِّرِ", englishName: "Al-Muddaththir", englishNameTranslation: "The Cloaked One", revelationType: "Meccan", numberOfAyahs: 56 },
  { number: 75, name: "سُورَةُ القِيَامَةِ", englishName: "Al-Qiyamah", englishNameTranslation: "The Resurrection", revelationType: "Meccan", numberOfAyahs: 40 },
  { number: 76, name: "سُورَةُ الإِنْسَانِ", englishName: "Al-Insan", englishNameTranslation: "The Human", revelationType: "Medinan", numberOfAyahs: 31 },
  { number: 77, name: "سُورَةُ المُرْسَلَاتِ", englishName: "Al-Mursalat", englishNameTranslation: "The Emissaries", revelationType: "Meccan", numberOfAyahs: 50 },
  { number: 78, name: "سُورَةُ النَّبَإِ", englishName: "An-Naba", englishNameTranslation: "The Tidings", revelationType: "Meccan", numberOfAyahs: 40 },
  { number: 79, name: "سُورَةُ النَّازِعَاتِ", englishName: "An-Nazi'at", englishNameTranslation: "Those who drag forth", revelationType: "Meccan", numberOfAyahs: 46 },
  { number: 80, name: "سُورَةُ عَبَسَ", englishName: "'Abasa", englishNameTranslation: "He Frowned", revelationType: "Meccan", numberOfAyahs: 42 },
  { number: 81, name: "سُورَةُ التَّكْوِيرِ", englishName: "At-Takwir", englishNameTranslation: "The Overthrowing", revelationType: "Meccan", numberOfAyahs: 29 },
  { number: 82, name: "سُورَةُ الإِنْفِطَارِ", englishName: "Al-Infitar", englishNameTranslation: "The Cleaving", revelationType: "Meccan", numberOfAyahs: 19 },
  { number: 83, name: "سُورَةُ المُطَفِّفِينَ", englishName: "Al-Mutaffifin", englishNameTranslation: "Defrauding", revelationType: "Meccan", numberOfAyahs: 36 },
  { number: 84, name: "سُورَةُ الإِنْشِقَاقِ", englishName: "Al-Inshiqaq", englishNameTranslation: "The Splitting Open", revelationType: "Meccan", numberOfAyahs: 25 },
  { number: 85, name: "سُورَةُ البُرُوجِ", englishName: "Al-Buruj", englishNameTranslation: "The Mansions of the Stars", revelationType: "Meccan", numberOfAyahs: 22 },
  { number: 86, name: "سُورَةُ الطَّارِقِ", englishName: "At-Tariq", englishNameTranslation: "The Morning Star", revelationType: "Meccan", numberOfAyahs: 17 },
  { number: 87, name: "سُورَةُ الأَعْلَىٰ", englishName: "Al-A'la", englishNameTranslation: "The Most High", revelationType: "Meccan", numberOfAyahs: 19 },
  { number: 88, name: "سُورَةُ الغَاشِيَةِ", englishName: "Al-Ghashiyah", englishNameTranslation: "The Overwhelming Event", revelationType: "Meccan", numberOfAyahs: 26 },
  { number: 89, name: "سُورَةُ الفَجْرِ", englishName: "Al-Fajr", englishNameTranslation: "The Dawn", revelationType: "Meccan", numberOfAyahs: 30 },
  { number: 90, name: "سُورَةُ البَلَدِ", englishName: "Al-Balad", englishNameTranslation: "The City", revelationType: "Meccan", numberOfAyahs: 20 },
  { number: 91, name: "سُورَةُ الشَّمْسِ", englishName: "Ash-Shams", englishNameTranslation: "The Sun", revelationType: "Meccan", numberOfAyahs: 15 },
  { number: 92, name: "سُورَةُ اللَّيْلِ", englishName: "Al-Layl", englishNameTranslation: "The Night", revelationType: "Meccan", numberOfAyahs: 21 },
  { number: 93, name: "سُورَةُ الضُّحَىٰ", englishName: "Ad-Duhaa", englishNameTranslation: "The Morning Hours", revelationType: "Meccan", numberOfAyahs: 11, tag: "Solace & Consolation", tagColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { number: 94, name: "سُورَةُ الشَّرْحِ", englishName: "Ash-Sharh", englishNameTranslation: "The Relief", revelationType: "Meccan", numberOfAyahs: 8, tag: "With Hardship Comes Ease", tagColor: "bg-teal-50 text-teal-700 border-teal-200" },
  { number: 95, name: "سُورَةُ التِّينِ", englishName: "At-Tin", englishNameTranslation: "The Fig", revelationType: "Meccan", numberOfAyahs: 8 },
  { number: 96, name: "سُورَةُ العَلَقِ", englishName: "Al-'Alaq", englishNameTranslation: "The Clot", revelationType: "Meccan", numberOfAyahs: 19, tag: "First Revelation (Iqra)", tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { number: 97, name: "سُورَةُ القَدْرِ", englishName: "Al-Qadr", englishNameTranslation: "Night of Decree", revelationType: "Meccan", numberOfAyahs: 5 },
  { number: 98, name: "سُورَةُ البَيِّنَةِ", englishName: "Al-Bayyinah", englishNameTranslation: "The Clear Evidence", revelationType: "Medinan", numberOfAyahs: 8 },
  { number: 99, name: "سُورَةُ الزَّلْزَلَةِ", englishName: "Az-Zalzalah", englishNameTranslation: "The Earthquake", revelationType: "Medinan", numberOfAyahs: 8 },
  { number: 100, name: "سُورَةُ العَادِيَاتِ", englishName: "Al-'Adiyat", englishNameTranslation: "The Courser", revelationType: "Meccan", numberOfAyahs: 11 },
  { number: 101, name: "سُورَةُ القَارِعَةِ", englishName: "Al-Qari'ah", englishNameTranslation: "The Calamity", revelationType: "Meccan", numberOfAyahs: 11 },
  { number: 102, name: "سُورَةُ التَّكَاثُرِ", englishName: "At-Takathur", englishNameTranslation: "Rivalry in worldly increase", revelationType: "Meccan", numberOfAyahs: 8 },
  { number: 103, name: "سُورَةُ العَصْرِ", englishName: "Al-'Asr", englishNameTranslation: "The Declining Day", revelationType: "Meccan", numberOfAyahs: 3 },
  { number: 104, name: "سُورَةُ الهُمَزَةِ", englishName: "Al-Humazah", englishNameTranslation: "The Traducer", revelationType: "Meccan", numberOfAyahs: 9 },
  { number: 105, name: "سُورَةُ الفِيلِ", englishName: "Al-Fil", englishNameTranslation: "The Elephant", revelationType: "Meccan", numberOfAyahs: 5 },
  { number: 106, name: "سُورَةُ قُرَيْشٍ", englishName: "Quraysh", englishNameTranslation: "Quraysh", revelationType: "Meccan", numberOfAyahs: 4 },
  { number: 107, name: "سُورَةُ المَاعُونِ", englishName: "Al-Ma'un", englishNameTranslation: "Small Kindnesses", revelationType: "Meccan", numberOfAyahs: 7 },
  { number: 108, name: "سُورَةُ الكَوْثَرِ", englishName: "Al-Kawthar", englishNameTranslation: "The Abundance", revelationType: "Meccan", numberOfAyahs: 3 },
  { number: 109, name: "سُورَةُ الكَافِرُونَ", englishName: "Al-Kafirun", englishNameTranslation: "The Disbelievers", revelationType: "Meccan", numberOfAyahs: 6 },
  { number: 110, name: "سُورَةُ النَّصْرِ", englishName: "An-Nasr", englishNameTranslation: "The Divine Support", revelationType: "Medinan", numberOfAyahs: 3 },
  { number: 111, name: "سُورَةُ المَسَدِ", englishName: "Al-Masad", englishNameTranslation: "The Palm Fibre", revelationType: "Meccan", numberOfAyahs: 5 },
  { number: 112, name: "سُورَةُ الإِخْلَاصِ", englishName: "Al-Ikhlas", englishNameTranslation: "The Sincerity", revelationType: "Meccan", numberOfAyahs: 4, tag: "Equal to 1/3 Quran", tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { number: 113, name: "سُورَةُ الفَلَقِ", englishName: "Al-Falaq", englishNameTranslation: "The Daybreak", revelationType: "Meccan", numberOfAyahs: 5, tag: "Mu'awwidhatayn", tagColor: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { number: 114, name: "سُورَةُ النَّاسِ", englishName: "An-Nas", englishNameTranslation: "Mankind", revelationType: "Meccan", numberOfAyahs: 6, tag: "Protective Surah", tagColor: "bg-indigo-50 text-indigo-700 border-indigo-200" },
];

// Complete 30 Paras (Juz) catalog
export const PARAS_CATALOG: ParaMeta[] = [
  { number: 1, arabicName: "آلم", englishName: "Alif-Lam-Meem", surahsIncluded: "Al-Fatihah (1) - Al-Baqarah (141)", totalVersesApprox: 148 },
  { number: 2, arabicName: "سَيَقُولُ", englishName: "Sayaqool", surahsIncluded: "Al-Baqarah (142 - 252)", totalVersesApprox: 111 },
  { number: 3, arabicName: "تِلْكَ الرُّسُلُ", englishName: "Tilkar-Rusul", surahsIncluded: "Al-Baqarah (253) - Ali 'Imran (92)", totalVersesApprox: 126 },
  { number: 4, arabicName: "لَنْ تَنَالُوا", englishName: "Lan Tanaaloo", surahsIncluded: "Ali 'Imran (93) - An-Nisa (23)", totalVersesApprox: 131 },
  { number: 5, arabicName: "وَالمُحْصَنَاتُ", englishName: "Wal-Muhsanat", surahsIncluded: "An-Nisa (24 - 147)", totalVersesApprox: 124 },
  { number: 6, arabicName: "لَا يُحِبُّ اللَّهُ", englishName: "La Yuhibbullah", surahsIncluded: "An-Nisa (148) - Al-Ma'idah (81)", totalVersesApprox: 110 },
  { number: 7, arabicName: "وَإِذَا سَمِعُوا", englishName: "Wa Iza Sami'oo", surahsIncluded: "Al-Ma'idah (82) - Al-An'am (110)", totalVersesApprox: 149 },
  { number: 8, arabicName: "وَلَوْ أَنَّنَا", englishName: "Wa Lau Annana", surahsIncluded: "Al-An'am (111) - Al-A'raf (87)", totalVersesApprox: 142 },
  { number: 9, arabicName: "قَالَ المَلَأُ", englishName: "Qalal-Mala'o", surahsIncluded: "Al-A'raf (88) - Al-Anfal (40)", totalVersesApprox: 159 },
  { number: 10, arabicName: "وَاعْلَمُوا", englishName: "Wa'lamoo", surahsIncluded: "Al-Anfal (41) - At-Tawbah (92)", totalVersesApprox: 127 },
  { number: 11, arabicName: "يَعْتَذِرُونَ", englishName: "Ya'taziroon", surahsIncluded: "At-Tawbah (93) - Hud (5)", totalVersesApprox: 151 },
  { number: 12, arabicName: "وَمَا مِنْ دَابَّةٍ", englishName: "Wa Mamin Da'abbah", surahsIncluded: "Hud (6) - Yusuf (52)", totalVersesApprox: 170 },
  { number: 13, arabicName: "وَمَا أُبَرِّئُ", englishName: "Wa Ma Ubarri'u", surahsIncluded: "Yusuf (53) - Ibrahim (52)", totalVersesApprox: 154 },
  { number: 14, arabicName: "رُبَمَا", englishName: "Rubama", surahsIncluded: "Al-Hijr (1) - An-Nahl (128)", totalVersesApprox: 227 },
  { number: 15, arabicName: "سُبْحَانَ الَّذِي", englishName: "Subhanallazi", surahsIncluded: "Al-Isra (1) - Al-Kahf (74)", totalVersesApprox: 185 },
  { number: 16, arabicName: "قَالَ أَلَمْ", englishName: "Qala Alam", surahsIncluded: "Al-Kahf (75) - Ta-Ha (135)", totalVersesApprox: 269 },
  { number: 17, arabicName: "اقْتَرَبَ لِلنَّاسِ", englishName: "Iqtaraba Lin-Nasi", surahsIncluded: "Al-Anbiya (1) - Al-Hajj (78)", totalVersesApprox: 190 },
  { number: 18, arabicName: "قَدْ أَفْلَحَ", englishName: "Qad Aflaha", surahsIncluded: "Al-Mu'minun (1) - Al-Furqan (20)", totalVersesApprox: 202 },
  { number: 19, arabicName: "وَقَالَ الَّذِينَ", englishName: "Wa Qalallazina", surahsIncluded: "Al-Furqan (21) - An-Naml (55)", totalVersesApprox: 339 },
  { number: 20, arabicName: "أَمَّنْ خَلَقَ", englishName: "A'man Khalaqa", surahsIncluded: "An-Naml (56) - Al-'Ankabut (45)", totalVersesApprox: 171 },
  { number: 21, arabicName: "اتْلُ مَا أُوحِيَ", englishName: "Utlu Ma Oohiya", surahsIncluded: "Al-'Ankabut (46) - Al-Ahzab (30)", totalVersesApprox: 178 },
  { number: 22, arabicName: "وَمَنْ يَقْنُتْ", englishName: "Wa Manyaqnut", surahsIncluded: "Al-Ahzab (31) - Ya-Sin (27)", totalVersesApprox: 169 },
  { number: 23, arabicName: "وَمَا لِيَ", englishName: "Wa Maliya", surahsIncluded: "Ya-Sin (28) - Az-Zumar (31)", totalVersesApprox: 357 },
  { number: 24, arabicName: "فَمَنْ أَظْلَمُ", englishName: "Faman Azlamu", surahsIncluded: "Az-Zumar (32) - Fussilat (46)", totalVersesApprox: 175 },
  { number: 25, arabicName: "إِلَيْهِ يُرَدُّ", englishName: "Ilayhi Yuraddu", surahsIncluded: "Fussilat (47) - Al-Jathiyah (37)", totalVersesApprox: 246 },
  { number: 26, arabicName: "حم", englishName: "Ha-Meem", surahsIncluded: "Al-Ahqaf (1) - Adh-Dhariyat (30)", totalVersesApprox: 195 },
  { number: 27, arabicName: "قَالَ فَمَا خَطْبُكُمْ", englishName: "Qala Fama Khatbukum", surahsIncluded: "Adh-Dhariyat (31) - Al-Hadid (29)", totalVersesApprox: 399 },
  { number: 28, arabicName: "قَدْ سَمِعَ اللَّهُ", englishName: "Qad Sami'allah", surahsIncluded: "Al-Mujadila (1) - At-Tahrim (12)", totalVersesApprox: 137 },
  { number: 29, arabicName: "تَبَارَكَ الَّذِي", englishName: "Tabarakallazi", surahsIncluded: "Al-Mulk (1) - Al-Mursalat (50)", totalVersesApprox: 431 },
  { number: 30, arabicName: "عَمَّ يَتَسَاءَلُونَ", englishName: "'Amma Yatasa'aloon", surahsIncluded: "An-Naba (78) - An-Nas (114)", totalVersesApprox: 564 },
];

// In-memory cache for ultra-fast tab switches and zero re-fetching
const surahCache = new Map<number, { surah: SurahMeta; ayahs: Ayah[] }>();
const paraCache = new Map<number, { para: ParaMeta; ayahs: Ayah[] }>();

/**
 * Fetch Surah with Arabic text, Jalandhry Urdu translation, and Alafasy audio
 * Endpoint: https://api.alquran.cloud/v1/surah/{SURAH_NUMBER}/editions/quran-uthmani,ur.jalandhry,ar.alafasy
 */
export async function fetchSurahData(surahNumber: number): Promise<{ surah: SurahMeta; ayahs: Ayah[] }> {
  if (surahCache.has(surahNumber)) {
    return surahCache.get(surahNumber)!;
  }

  // Check localStorage for offline support
  const localKey = `nur_quran_surah_${surahNumber}`;
  try {
    const cachedStr = localStorage.getItem(localKey);
    if (cachedStr) {
      const parsed = JSON.parse(cachedStr);
      if (parsed && Array.isArray(parsed.ayahs) && parsed.ayahs.length > 0) {
        surahCache.set(surahNumber, parsed);
        return parsed;
      }
    }
  } catch {}

  let arabicData: any;
  let urduData: any;
  let audioData: any = {};

  try {
    const endpoint = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,ur.jalandhry,ar.alafasy`;
    const response = await fetch(endpoint);
    if (response.ok) {
      const json = await response.json();
      if (json && json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
        arabicData = json.data[0];
        urduData = json.data[1];
        audioData = json.data[2] || {};
      }
    }
  } catch (err) {
    console.warn(`Combined Surah fetch failed for #${surahNumber}, falling back:`, err);
  }

  // Resilient fallback: fetch Arabic and Urdu in parallel if combined endpoint fails
  if (!arabicData || !urduData) {
    const [arRes, urRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ur.jalandhry`)
    ]);

    if (!arRes.ok) throw new Error(`Failed to load Surah ${surahNumber}: HTTP ${arRes.status}`);
    if (!urRes.ok) throw new Error(`Failed to load Surah ${surahNumber} Urdu: HTTP ${urRes.status}`);

    const [arJson, urJson] = await Promise.all([arRes.json(), urRes.json()]);
    arabicData = arJson.data;
    urduData = urJson.data;
  }

  const metaFromCatalog = SURAHS_CATALOG.find(s => s.number === surahNumber) || {
    number: surahNumber,
    name: arabicData.name || `سورة ${surahNumber}`,
    englishName: arabicData.englishName || `Surah ${surahNumber}`,
    englishNameTranslation: arabicData.englishNameTranslation || '',
    revelationType: arabicData.revelationType || 'Meccan',
    numberOfAyahs: arabicData.numberOfAyahs || arabicData.ayahs.length
  };

  const ayahs: Ayah[] = arabicData.ayahs.map((arabicAyah: any, idx: number) => {
    const urduAyah = (urduData?.ayahs && urduData.ayahs[idx]) || {};
    const audioAyah = (audioData?.ayahs && audioData.ayahs[idx]) || {};
    const numberInSurah = arabicAyah.numberInSurah || idx + 1;

    return {
      number: arabicAyah.number,
      numberInSurah,
      text: arabicAyah.text,
      urduText: urduAyah.text || '',
      audioUrl: audioAyah.audio || getEveryAyahAudioUrl(surahNumber, numberInSurah),
      fallbackAudioUrl: getEveryAyahAudioUrl(surahNumber, numberInSurah),
      surahNumber,
      surahName: metaFromCatalog.englishName,
      juz: arabicAyah.juz || 1,
      page: arabicAyah.page
    };
  });

  const result = { surah: metaFromCatalog, ayahs };
  surahCache.set(surahNumber, result);
  try {
    localStorage.setItem(localKey, JSON.stringify(result));
  } catch {}

  return result;
}

/**
 * Fetch Para (Juz) with Arabic text, Jalandhry Urdu translation, and Alafasy audio
 * Note: Al-Quran Cloud supports individual edition paths for Juz (/v1/juz/{juz}/{edition}).
 * We fetch Arabic text and Urdu translation concurrently, with EveryAyah CDN audio streaming.
 */
export async function fetchParaData(paraNumber: number): Promise<{ para: ParaMeta; ayahs: Ayah[] }> {
  if (paraCache.has(paraNumber)) {
    return paraCache.get(paraNumber)!;
  }

  const localKey = `nur_quran_para_${paraNumber}`;
  try {
    const cachedStr = localStorage.getItem(localKey);
    if (cachedStr) {
      const parsed = JSON.parse(cachedStr);
      if (parsed && Array.isArray(parsed.ayahs) && parsed.ayahs.length > 0) {
        paraCache.set(paraNumber, parsed);
        return parsed;
      }
    }
  } catch {}

  // Fetch Arabic text and Urdu translation concurrently
  const [arabicRes, urduRes] = await Promise.all([
    fetch(`https://api.alquran.cloud/v1/juz/${paraNumber}/quran-uthmani`),
    fetch(`https://api.alquran.cloud/v1/juz/${paraNumber}/ur.jalandhry`)
  ]);

  if (!arabicRes.ok) {
    throw new Error(`Failed to load Para ${paraNumber} Arabic text: HTTP ${arabicRes.status}`);
  }
  if (!urduRes.ok) {
    throw new Error(`Failed to load Para ${paraNumber} Urdu translation: HTTP ${urduRes.status}`);
  }

  const [arabicJson, urduJson] = await Promise.all([
    arabicRes.json(),
    urduRes.json()
  ]);

  if (arabicJson?.code !== 200 || !arabicJson.data || !Array.isArray(arabicJson.data.ayahs)) {
    throw new Error(`Invalid Arabic response structure for Para ${paraNumber}`);
  }

  const arabicAyahs = arabicJson.data.ayahs;
  const urduAyahs = Array.isArray(urduJson?.data?.ayahs) ? urduJson.data.ayahs : [];

  // Non-blocking fetch of audio edition if available
  let audioMap: Record<number, string> = {};
  try {
    const audioRes = await fetch(`https://api.alquran.cloud/v1/juz/${paraNumber}/ar.alafasy`);
    if (audioRes.ok) {
      const audioJson = await audioRes.json();
      if (Array.isArray(audioJson?.data?.ayahs)) {
        for (const a of audioJson.data.ayahs) {
          if (a.number && a.audio) {
            audioMap[a.number] = a.audio;
          }
        }
      }
    }
  } catch {
    // EveryAyah fallback works seamlessly
  }

  const metaFromCatalog = PARAS_CATALOG.find(p => p.number === paraNumber) || {
    number: paraNumber,
    arabicName: `الجزء ${paraNumber}`,
    englishName: `Juz ${paraNumber}`,
    surahsIncluded: '',
    totalVersesApprox: arabicAyahs.length
  };

  const ayahs: Ayah[] = arabicAyahs.map((arabicAyah: any, idx: number) => {
    const urduAyah = urduAyahs[idx] || {};
    const surahInfo = arabicAyah.surah || {};
    const surahNum = surahInfo.number || 1;
    const numberInSurah = arabicAyah.numberInSurah || idx + 1;

    return {
      number: arabicAyah.number,
      numberInSurah,
      text: arabicAyah.text,
      urduText: urduAyah.text || '',
      audioUrl: audioMap[arabicAyah.number] || getEveryAyahAudioUrl(surahNum, numberInSurah),
      fallbackAudioUrl: getEveryAyahAudioUrl(surahNum, numberInSurah),
      surahNumber: surahNum,
      surahName: surahInfo.englishName || `Surah ${surahNum}`,
      juz: paraNumber,
      page: arabicAyah.page
    };
  });

  const result = { para: metaFromCatalog, ayahs };
  paraCache.set(paraNumber, result);
  try {
    localStorage.setItem(localKey, JSON.stringify(result));
  } catch {}

  return result;
}
