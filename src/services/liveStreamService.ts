import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const SETTINGS_DOC_PATH = 'system_settings';
const LIVE_STREAM_DOC_ID = 'livestream_config';

// Verified 24/7 official KSA live stream IDs
export const DEFAULT_MAKKAH_STREAM = 'https://www.youtube.com/watch?v=R_iJbC-A200';
export const DEFAULT_MADINAH_STREAM = 'https://www.youtube.com/watch?v=Xpk9X8Vf5_4';

const LOCAL_STORAGE_KEY_MAKKAH = 'admin_makkah_live_url';
const LOCAL_STORAGE_KEY_MADINAH = 'admin_madinah_live_url';

export interface LiveStreamConfig {
  makkahUrl: string;
  madinahUrl: string;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Extracts YouTube video ID from standard watch, share, live, and embed links
 */
export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/))([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

/**
 * Converts any YouTube link (watch, live, share) into a high-compatibility embed URL
 */
export function getYoutubeEmbedUrl(url: string, autoPlay = true, isMuted = true): string {
  const videoId = extractYoutubeId(url);
  if (videoId) {
    const params = new URLSearchParams({
      autoplay: autoPlay ? '1' : '0',
      mute: isMuted ? '1' : '0',
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
      enablejsapi: '1'
    });
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  }
  return url;
}

/**
 * Fetch current live stream URLs from Firestore with localStorage fallback
 */
export async function getLiveStreamConfig(): Promise<LiveStreamConfig> {
  const localMakkah = localStorage.getItem(LOCAL_STORAGE_KEY_MAKKAH);
  const localMadinah = localStorage.getItem(LOCAL_STORAGE_KEY_MADINAH);

  try {
    const docRef = doc(db, SETTINGS_DOC_PATH, LIVE_STREAM_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<LiveStreamConfig>;
      const config: LiveStreamConfig = {
        makkahUrl: data.makkahUrl || localMakkah || DEFAULT_MAKKAH_STREAM,
        madinahUrl: data.madinahUrl || localMadinah || DEFAULT_MADINAH_STREAM,
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_MAKKAH, config.makkahUrl);
      localStorage.setItem(LOCAL_STORAGE_KEY_MADINAH, config.madinahUrl);
      return config;
    }
  } catch (err) {
    console.warn('Could not fetch livestream config from Firestore, using local fallback:', err);
  }

  return {
    makkahUrl: localMakkah || DEFAULT_MAKKAH_STREAM,
    madinahUrl: localMadinah || DEFAULT_MADINAH_STREAM,
  };
}

/**
 * Update live stream URLs in both Firestore and localStorage
 */
export async function updateLiveStreamConfig(makkahUrl: string, madinahUrl?: string): Promise<void> {
  const cleanMakkah = makkahUrl.trim();
  const cleanMadinah = (madinahUrl || DEFAULT_MADINAH_STREAM).trim();

  // Save to localStorage immediately
  localStorage.setItem(LOCAL_STORAGE_KEY_MAKKAH, cleanMakkah);
  if (madinahUrl) {
    localStorage.setItem(LOCAL_STORAGE_KEY_MADINAH, cleanMadinah);
  }

  // Broadcast event so open tabs/components react immediately
  window.dispatchEvent(new CustomEvent('livestream-updated', {
    detail: { makkahUrl: cleanMakkah, madinahUrl: cleanMadinah }
  }));

  // Save to Firestore for all users
  try {
    const docRef = doc(db, SETTINGS_DOC_PATH, LIVE_STREAM_DOC_ID);
    await setDoc(docRef, {
      makkahUrl: cleanMakkah,
      madinahUrl: cleanMadinah,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin (Danish)',
    }, { merge: true });
  } catch (err) {
    console.warn('Could not sync livestream update to Firestore:', err);
  }
}
