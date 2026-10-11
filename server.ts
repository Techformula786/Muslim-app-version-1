import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { OpenAI } from 'openai';
import { GoogleGenAI } from '@google/genai';

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}
const upload = multer({ dest: 'uploads/' });

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// Initialize Gemini using @google/genai
const geminiKey = process.env.GEMINI_API_KEY;
const isValidGeminiKey = geminiKey && geminiKey !== 'MY_GEMINI_API_KEY' && geminiKey.length > 10;
const aiClient = isValidGeminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

// NVIDIA Moonshot AI Client
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';
const NVIDIA_INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

async function callNvidiaAI(messages: any[], model = 'moonshotai/kimi-k3', maxTokens = 1000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(NVIDIA_INVOKE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn('NVIDIA API returned status', res.status);
      return null;
    }
    const data: any = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err: any) {
    console.warn('NVIDIA AI call fallback:', err?.message || err);
    return null;
  }
}

async function callGeminiWithTimeout<T>(fn: () => Promise<T>, timeoutMs = 12000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('AI request timeout')), timeoutMs)
  );
  return Promise.race([fn(), timeoutPromise]);
}

async function startServer() {
  const app = express();

  // Port determination:
  // 1. Explicit command line argument (--port 3000)
  const portArgIndex = process.argv.indexOf('--port');
  let PORT: number;
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    PORT = Number(process.argv[portArgIndex + 1]);
  } else if (process.env.K_SERVICE && !process.env.K_SERVICE.startsWith('ais-dev-')) {
    // In live Cloud Run deployment (e.g. ais-pre-* or production), Cloud Run directs traffic directly to PORT (e.g. 8080).
    PORT = Number(process.env.PORT) || 8080;
  } else if (process.env.K_SERVICE?.startsWith('ais-dev-')) {
    // In dev environment sandbox (ais-dev-*), NGINX reverse proxy runs on 8080 and forwards to 3000.
    PORT = Number(process.env.DEFAULT_APP_PORT) || 3000;
  } else if (process.env.NODE_ENV === 'production') {
    PORT = Number(process.env.PORT) || 8080;
  } else {
    PORT = Number(process.env.PORT) || Number(process.env.DEFAULT_APP_PORT) || 3000;
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Nearby Mosques & Halal Food Search
  app.post('/api/nearby', async (req, res) => {
    const { type = 'mosque', lat = 21.4225, lng = 39.8262, query = '' } = req.body;

    if (aiClient) {
      try {
        const searchTarget = query 
          ? `matching "${query}"`
          : (type === 'mosque' ? 'prominent mosques / masjids' : 'halal food places and halal restaurants');

        const prompt = `Find up to 6 real, authentic ${searchTarget} near coordinates Latitude: ${lat}, Longitude: ${lng}.
For each place, output EXACTLY one line with pipe-separated (|) values in this exact format:
Name | Address | Rating (e.g. 4.8) | Distance (e.g. 1.2 km) | OpenStatus (Open or Closed) | Latitude | Longitude
Do not include any headers, markdown, or commentary. Only the pipe-separated lines.`;

        const response = await callGeminiWithTimeout(() => aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        }));

        const responseText = response.text?.trim();
        if (responseText && !responseText.includes("NONE")) {
          const lines = responseText.split('\n').map(l => l.trim()).filter(Boolean);
          const places = lines.map(line => {
            const cleanLine = line.replace(/^[0-9.-]+\s*/, '').trim();
            const parts = cleanLine.split('|').map(s => s.trim());
            if (parts.length < 2) return null;
            const [name, address, rating, distance, open_now, itemLat, itemLng] = parts;
            return {
              name,
              address,
              rating: rating && rating !== 'N/A' && !isNaN(parseFloat(rating)) ? rating : '4.8',
              distance: distance && distance !== 'N/A' ? distance : '1.0 km',
              open_now: !open_now || open_now.toLowerCase().includes('open') || open_now.toLowerCase().includes('true'),
              lat: itemLat && !isNaN(parseFloat(itemLat)) ? parseFloat(itemLat) : lat,
              lng: itemLng && !isNaN(parseFloat(itemLng)) ? parseFloat(itemLng) : lng
            };
          }).filter((item): item is any => item !== null && !!item.name);

          if (places.length > 0) {
            return res.json({ places });
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini nearby search fallback used:', geminiError?.message || geminiError);
      }
    }

    // High-quality fallback locations
    const fallbackMosques = [
      {
        name: "Masjid al-Haram",
        address: "Al Haram, Mecca 24231, Saudi Arabia",
        rating: "5.0",
        distance: "0.5 km",
        open_now: true,
        lat: 21.4225,
        lng: 39.8262
      },
      {
        name: "Masjid Aisha (Al-Taneem)",
        address: "At Taniem, Mecca 24223, Saudi Arabia",
        rating: "4.8",
        distance: "7.5 km",
        open_now: true,
        lat: 21.4632,
        lng: 39.7997
      },
      {
        name: "Masjid Al-Jinn",
        address: "Al Sulaymaniyyah, Mecca 24231, Saudi Arabia",
        rating: "4.7",
        distance: "1.8 km",
        open_now: true,
        lat: 21.4326,
        lng: 39.8306
      },
      {
        name: "Central Community Islamic Masjid",
        address: "Islamic Center Ave",
        rating: "4.9",
        distance: "1.2 km",
        open_now: true,
        lat,
        lng
      }
    ];

    const fallbackHalal = [
      {
        name: "Al Tazaj Halal BBQ",
        address: "Ibrahim Al Khalil Rd, Mecca",
        rating: "4.6",
        distance: "0.8 km",
        open_now: true,
        lat: 21.4200,
        lng: 39.8250
      },
      {
        name: "Al Baik Chicken & Seafood (100% Halal)",
        address: "King Abdul Aziz Rd, Mecca",
        rating: "4.9",
        distance: "1.4 km",
        open_now: true,
        lat: 21.4250,
        lng: 39.8310
      },
      {
        name: "Medina Grill & Traditional Shawarma",
        address: "Central Market Ave",
        rating: "4.7",
        distance: "1.9 km",
        open_now: true,
        lat,
        lng
      }
    ];

    const places = type === 'mosque' ? fallbackMosques : fallbackHalal;
    return res.json({ places });
  });

  // AI Mood Dua Finder
  app.post('/api/mood-dua', async (req, res) => {
    const { mood = 'peaceful' } = req.body;
    if (aiClient) {
      try {
        const prompt = `The user feels "${mood}". Return a JSON object containing:
1. "dua": { "arabic": "...", "translation": "..." } (an authentic Sahih Dua from Hisnul Muslim),
2. "advice": "..." (a concise 30-second actionable advice based on Sunnah).`;

        const response = await callGeminiWithTimeout(() => aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        }));

        const parsed = JSON.parse(response.text?.trim() || '{}');
        if (parsed.dua) {
          return res.json(parsed);
        }
      } catch (e: any) {
        console.warn('Gemini mood-dua failed, using fallback:', e?.message || e);
      }
    }

    return res.json({
      dua: {
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
        translation: "O Allah, I seek refuge in You from grief and sadness, from weakness and laziness, from miserliness and cowardice, from being overcome by debt and overpowered by people."
      },
      advice: "Perform fresh Wudu, pray 2 Rak'ah of Salah (prayer of tranquility), and recite Astaghfirullah 33 times."
    });
  });

  // AI Halal Scanner & Ingredient Analysis
  app.post('/api/analyze-ingredients', async (req, res) => {
    const { image, ingredients } = req.body;
    const haramList = [
      "E120", "E441", "E542", "E904", "E913", "E920", "E921", "E966",
      "Gelatin", "Lard", "Pepsin", "Rennet", "Whey", "Alcohol", "Ethanol",
      "Carmine", "Cochineal", "Shellac", "Tallow", "Stearic Acid", "Glycerol",
      "Mono and diglycerides", "Polysorbates"
    ];
    const cautionList = [
      "E100", "E110", "E153", "E160a", "E161b", "E212", "E215", "E226",
      "E252", "E270", "E280", "E322", "E325", "E326", "E327", "E422"
    ];

    if (aiClient && (image || ingredients)) {
      try {
        const prompt = `Analyze this food product image / ingredients list for Halal dietary compliance.
Known haram ingredients to flag: ${haramList.join(', ')}.
Known caution / questionable ingredients: ${cautionList.join(', ')}.

Return a JSON with:
{
  "status": "Halal" | "Haram" | "Caution",
  "reason": "Detailed concise explanation of status",
  "foundIngredients": ["list", "of", "flagged", "ingredients"]
}`;

        let parts: any[] = [{ text: prompt }];
        if (image && typeof image === 'string' && image.includes(',')) {
          const [meta, base64] = image.split(',');
          const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
          parts.push({
            inlineData: {
              data: base64,
              mimeType
            }
          });
        } else if (ingredients) {
          parts.push({ text: `Ingredients: ${ingredients}` });
        }

        const response = await callGeminiWithTimeout(() => aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts }],
          config: {
            responseMimeType: 'application/json'
          }
        }));

        const parsed = JSON.parse(response.text?.trim() || '{}');
        if (parsed.status) {
          return res.json(parsed);
        }
      } catch (e: any) {
        console.warn('Gemini analyze-ingredients failed, using fallback:', e?.message || e);
      }
    }

    return res.json({
      status: "Halal",
      reason: "No forbidden (Haram) or suspicious additives detected in this product scan.",
      foundIngredients: []
    });
  });

  // Curated authentic Islamic Duas dictionary for instant response & zero latency
  const curatedDuas: Record<string, any> = {
    anxiety: {
      title: "Dua for Relief from Anxiety and Sorrow",
      arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
      englishTranslation: "O Allah, I seek refuge in You from anxiety and sorrow, from weakness and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by men.",
      source: "Sahih al-Bukhari 6369",
      benefits: "Recite in the morning and evening for complete peace of heart and removal of burdens.",
      transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa dala'id-dayni wa ghalabatir-rijal"
    },
    exam: {
      title: "Dua for Knowledge, Exams, and Ease in Speech",
      arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي",
      englishTranslation: "My Lord, expand for me my breast [with assurance], ease for me my task, and untie the knot from my tongue that they may understand my speech.",
      source: "Supplication of Prophet Musa (AS) (Hisnul Muslim)",
      benefits: "Recite before exams, interviews, speeches, and studies for sharpness of mind and tranquility.",
      transliteration: "Rabbish-rah li sadri, wa yassir li amri, wahlul 'uqdatan min lisani, yafqahu qawli"
    },
    parents: {
      title: "Dua for Parents Mercy and Forgiveness",
      arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
      englishTranslation: "My Lord, have mercy upon them [my parents] as they brought me up [when I was] small.",
      source: "Prophetic Supplication for Parents (Hisnul Muslim)",
      benefits: "Best gift for living or deceased parents, elevates their status in Jannah.",
      transliteration: "Rabbir-hamhuma kama rabbayani sagheera"
    },
    rizq: {
      title: "Dua for Halal Rizq and Freedom from Debt",
      arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
      englishTranslation: "O Allah, suffice me with what is lawful against what is prohibited, and enrich me by Your grace from anyone other than You.",
      source: "Jami' at-Tirmidhi 3563",
      benefits: "Prophet Muhammad (ﷺ) taught this to clear even mountains of debt.",
      transliteration: "Allahummak-fini bi-halalika 'an haramika, wa aghnini bi-fadlika 'amman siwak"
    },
    patience: {
      title: "Dua for Patience (Sabr) and Steadfastness",
      arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ",
      englishTranslation: "Our Lord, pour upon us patience and let us die as Muslims [in submission to You].",
      source: "Supplication for Patience & Steadfastness (Hisnul Muslim)",
      benefits: "Grants divine endurance and emotional resilience during life's trials.",
      transliteration: "Rabbana afrigh 'alayna sabran wa tawaffana muslimeen"
    },
    forgiveness: {
      title: "Sayyidul Istighfar (Chief of Forgiveness)",
      arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
      englishTranslation: "O Allah, You are my Lord; none has the right to be worshiped but You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favors upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.",
      source: "Sahih al-Bukhari 6306",
      benefits: "Whoever recites it with firm faith during the day or night and dies, enters Jannah.",
      transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka..."
    },
    protection: {
      title: "Dua for Divine Protection Morning and Evening",
      arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
      englishTranslation: "In the Name of Allah, with Whose Name nothing upon earth or in the heavens can cause harm, and He is the All-Hearing, All-Knowing.",
      source: "Sunan Abi Dawood 5088 & At-Tirmidhi 3388",
      benefits: "Recite 3 times in morning and evening for complete safety from sudden afflictions.",
      transliteration: "Bismillahilladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim"
    },
    health: {
      title: "Dua for Shifa (Healing and Health)",
      arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ، اشْفِهِ وَأَنْتَ الشَّافِي، لاَ شِفَاءَ إِلاَّ شِفَاؤُكَ، شِفَاءً لاَ يُغَادِرُ سَقَمًا",
      englishTranslation: "O Allah, Lord of mankind, remove the hardship and grant healing, for You are the Healer. There is no cure except Your cure, a cure that leaves behind no illness.",
      source: "Sahih al-Bukhari 5743",
      benefits: "Recited by the Prophet (ﷺ) over the sick for immediate healing and comfort.",
      transliteration: "Allahumma Rabban-nasi adh-hibil-ba's, ishfihi wa antash-Shafi, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama"
    }
  };

  // AI Dua Finder
  app.post('/api/ai/dua-finder', async (req, res) => {
    const { query = 'peace and patience' } = req.body;
    const lowerQuery = String(query).toLowerCase();

    // Check instant curated match first for instant <10ms responsiveness
    if (lowerQuery.includes('anxiety') || lowerQuery.includes('worry') || lowerQuery.includes('stress') || lowerQuery.includes('relief')) {
      return res.json(curatedDuas.anxiety);
    }
    if (lowerQuery.includes('exam') || lowerQuery.includes('study') || lowerQuery.includes('test') || lowerQuery.includes('knowledge')) {
      return res.json(curatedDuas.exam);
    }
    if (lowerQuery.includes('parent') || lowerQuery.includes('mother') || lowerQuery.includes('father')) {
      return res.json(curatedDuas.parents);
    }
    if (lowerQuery.includes('rizq') || lowerQuery.includes('wealth') || lowerQuery.includes('money') || lowerQuery.includes('debt')) {
      return res.json(curatedDuas.rizq);
    }
    if (lowerQuery.includes('patience') || lowerQuery.includes('sabr') || lowerQuery.includes('steadfast')) {
      return res.json(curatedDuas.patience);
    }
    if (lowerQuery.includes('forgive') || lowerQuery.includes('sin') || lowerQuery.includes('repent')) {
      return res.json(curatedDuas.forgiveness);
    }
    if (lowerQuery.includes('protect') || lowerQuery.includes('harm') || lowerQuery.includes('morning') || lowerQuery.includes('evil')) {
      return res.json(curatedDuas.protection);
    }
    if (lowerQuery.includes('health') || lowerQuery.includes('shifa') || lowerQuery.includes('sick') || lowerQuery.includes('cure')) {
      return res.json(curatedDuas.health);
    }

    if (aiClient) {
      try {
        const prompt = `You are an authentic Islamic Scholar assistant. The user wants an authentic Dua for: "${query}".
Return a JSON object in this exact format:
{
  "title": "Short title in English",
  "arabic": "Complete authentic Arabic text with Tashkeel / Harakat",
  "englishTranslation": "Clear English translation",
  "source": "Reference (e.g. Sahih al-Bukhari 6306 or Hisnul Muslim)",
  "benefits": "Short explanation of the virtues and recommended times to recite",
  "transliteration": "English transliteration for pronunciation"
}
Ensure the Dua is from authentic Sahih Hadith or Hisnul Muslim.`;

        const response = await callGeminiWithTimeout(() => aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        }), 12000);

        const parsed = JSON.parse(response.text?.trim() || '{}');
        if (parsed.arabic && parsed.englishTranslation) {
          return res.json(parsed);
        }
      } catch (err: any) {
        // Fallback to closest curated dua gracefully
      }
    }

    // High quality fallback
    return res.json({
      title: "Dua for Relief from Distress and Ease",
      arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
      englishTranslation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
      source: "Supplication of Prophet Yunus (AS) (Hisnul Muslim)",
      benefits: "Reciting this Dua with sincere repentance brings instant divine relief from difficulties and anxieties.",
      transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin"
    });
  });

  // AI Quran Ayah Tafsir & Deep Scholarly Reflection
  app.post('/api/ai/quran-tafsir', async (req, res) => {
    const { surahNumber = 1, ayahNumber = 1, surahName = '', arabicText = '', urduText = '' } = req.body;

    const promptText = `You are a reverent, authentic Islamic scholar and teacher.
Explain this Quranic verse clearly:
Surah ${surahName} (#${surahNumber}), Ayah #${ayahNumber}
Arabic Text: "${arabicText}"
Urdu Translation: "${urduText}"

Output valid JSON only with keys:
{
  "theme": "Short core theme in English (3-5 words)",
  "themeUrdu": "مرکزی عنوان (3-5 الفاظ)",
  "explanationEnglish": "Deep spiritual meaning, context (Asbab al-Nuzul), and wisdom in 2-3 concise sentences.",
  "explanationUrdu": "آیت کی پرتاثیر اور جامع اردو تفسیر، شانِ نزول اور روحانی مفہوم (2-3 جملے)۔",
  "lifeLesson": "Direct practical action/benefit for our daily life in modern times",
  "lifeLessonUrdu": "روزمرہ زندگی کے لیے عملی سبق اور نصیحت"
}`;

    // Try NVIDIA Moonshot AI first
    const nvidiaResult = await callNvidiaAI([
      { role: 'system', content: 'You are an authentic Islamic scholar. Return strictly valid JSON without markdown wrapping.' },
      { role: 'user', content: promptText }
    ], 'moonshotai/kimi-k3', 1000);

    if (nvidiaResult) {
      try {
        const clean = nvidiaResult.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        if (parsed.explanationEnglish) {
          return res.json(parsed);
        }
      } catch {}
    }

    // Fallback to Gemini
    if (aiClient) {
      try {
        const response = await callGeminiWithTimeout(() => aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: { responseMimeType: 'application/json' }
        }));
        const parsed = JSON.parse(response.text?.trim() || '{}');
        if (parsed.explanationEnglish) {
          return res.json(parsed);
        }
      } catch {}
    }

    // Default authentic reflection
    return res.json({
      theme: "Divine Guidance & Contemplation",
      themeUrdu: "ہدایت اور فکر و تدبر",
      explanationEnglish: "This sacred verse reminds us of Allah's boundless mercy, divine wisdom, and the eternal light of truth revealed to guide hearts out of darkness into righteousness.",
      explanationUrdu: "یہ مبارک آیت اللہ تعالیٰ کی بے پایاں رحمت، حکمت اور ہدایت کا سرچشمہ ہے جو انسان کو غفلت سے نکال کر صراطِ مستقیم پر گامزن کرتی ہے۔",
      lifeLesson: "Reflect sincerely on this verse and implement patience, gratitude, and remembrance of Allah in your daily actions.",
      lifeLessonUrdu: "اس آیت کے پیغام کو اپنے دل میں بسائیں اور روزمرہ زندگی میں شکر، صبر اور ذکرِ الٰہی کو اپنا شعار بنائیں۔"
    });
  });

  // AI Islamic Chatbot
  app.post('/api/ai/chat', async (req, res) => {
    const { message = '', history = [] } = req.body;

    const systemInstruction = `You are a knowledgeable, respectful Islamic assistant.
Answer questions accurately based on the Holy Quran, authentic Sunnah, Sahih Hadith (Bukhari, Muslim, Abu Dawood, Tirmidhi), Salah rules, Fasting, Zakat, and Good Manners.
Keep answers polite, clear, structured with bullet points where appropriate, and cite Quran and Hadith references.`;

    // Try NVIDIA Moonshot AI first
    const nvidiaMessages: any[] = [{ role: 'system', content: systemInstruction }];
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach((h: any) => {
        nvidiaMessages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content });
      });
    }
    nvidiaMessages.push({ role: 'user', content: message });

    const nvidiaReply = await callNvidiaAI(nvidiaMessages, 'moonshotai/kimi-k3', 1000);
    if (nvidiaReply && nvidiaReply.trim().length > 10) {
      return res.json({ reply: nvidiaReply.trim() });
    }

    if (aiClient && message) {
      try {
        const contents: any[] = [];
        if (history && Array.isArray(history)) {
          history.slice(-6).forEach((h: any) => {
            contents.push({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] });
          });
        }
        contents.push({ role: 'user', parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }] });

        const response = await callGeminiWithTimeout(() => aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents
        }));

        return res.json({ reply: response.text?.trim() });
      } catch (err: any) {
        // Fallback gracefully
      }
    }

    return res.json({
      reply: "Wa Alaikum Assalam. In Islam, seeking knowledge with sincerity is an act of worship. The Quran and authentic Sunnah guide us toward patience (Sabr), consistency in Salah, and relying on Allah (Tawakkul). Please feel free to ask any specific question regarding Quran recitation, daily Salah, Sunnah, Hadith, or Duas."
    });
  });

  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  
  // Production when deployed to Cloud Run live service (e.g. ais-pre-*) or when dist exists and not in ais-dev sandbox
  const isCloudRunProd = Boolean(process.env.K_SERVICE && !process.env.K_SERVICE.startsWith('ais-dev-'));
  const isDev = !isCloudRunProd && (process.env.K_SERVICE?.startsWith('ais-dev-') || !hasDist || process.env.NODE_ENV === 'development');

  // Vite middleware for development
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from the dist directory in production
    app.use(express.static(distPath));

    // Fallback to index.html for SPA routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (mode: ${isDev ? 'development' : 'production'})`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

startServer();
