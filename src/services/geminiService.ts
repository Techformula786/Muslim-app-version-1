export interface DuaResult {
  title: string;
  arabic: string;
  englishTranslation: string;
  source: string;
  benefits: string;
  transliteration?: string;
}

export async function findAiDua(query: string): Promise<DuaResult> {
  try {
    const res = await fetch('/api/ai/dua-finder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn("Using fallback dua:", e);
    return {
      title: "Dua for Ease and Comfort",
      arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
      englishTranslation: "My Lord, expand for me my breast [with assurance] and ease for me my task.",
      source: "Supplication of Prophet Musa (AS) (Hisnul Muslim)",
      benefits: "Recited for courage, clarity in speech, and ease in difficulties.",
      transliteration: "Rabbish rah li sadri wa yassir li amri"
    };
  }
}

export async function askIslamicAi(message: string, history: any[] = []): Promise<string> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.reply || "Allah knows best.";
  } catch (e) {
    console.warn("AI chat fallback:", e);
    return "In Islam, we turn to authentic Sunnah and Hadith for guidance. You may recite 'Rabbi Zidni Ilma' (My Lord, increase me in knowledge). Please check your internet connection and try again.";
  }
}

export async function getMoodDua(mood: string) {
  try {
    const res = await fetch('/api/mood-dua', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch mood dua:", e);
    return {
      dua: {
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
        translation: "O Allah, I seek refuge in You from grief and sadness, from weakness and laziness, from miserliness and cowardice, from being overcome by debt and overpowered by people."
      },
      advice: "Perform fresh Wudu, pray 2 Rak'ah of Salah (prayer of tranquility), and recite Astaghfirullah 33 times."
    };
  }
}

export async function analyzeIngredients(image: string, ingredients?: string) {
  try {
    const res = await fetch('/api/analyze-ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, ingredients })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("Failed to analyze ingredients:", e);
    return {
      status: "Caution",
      reason: "Could not analyze the ingredients clearly. Please check the packaging label manually.",
      foundIngredients: []
    };
  }
}
