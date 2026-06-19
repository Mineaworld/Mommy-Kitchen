import type { Category, Recipe } from "@/lib/types";

/**
 * Picks the best available voice for Khmer text.
 *
 * On Android with Google TTS, a km-KH voice is available once the
 * Khmer language pack has been installed in device settings:
 *   Settings → Languages & Input → Text-to-Speech → Install voice data
 *
 * Priority:
 *  1. Exact km-KH voice
 *  2. Any km-* variant
 *  3. null — fall through and let the browser try with lang="km-KH"
 *     (Android Chrome will use the system TTS engine which may
 *      still read Khmer even if getVoices() didn't list it explicitly)
 */
const pickKhmerVoice = (
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null => {
  if (voices.length === 0) return null;

  return (
    voices.find((v) => v.lang === "km-KH") ??
    voices.find((v) => v.lang.startsWith("km")) ??
    null
  );
};

/**
 * Returns a promise that resolves to the available voices.
 * On mobile Chrome (Android), voices are loaded asynchronously.
 * This helper waits for the "voiceschanged" event (up to 2 s).
 */
const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    let resolved = false;

    const done = () => {
      if (resolved) return;
      resolved = true;
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener("voiceschanged", done, {
      once: true,
    });

    // Timeout — on some devices the event never fires; resolve anyway
    setTimeout(done, 2000);
  });
};

/**
 * Creates a function that speaks a Khmer label using the Web Speech API.
 *
 * Key Android/Chrome fixes applied:
 *  - 150 ms delay after cancel() — Chrome silently drops utterances
 *    if speak() is called immediately after cancel().
 *  - Always sets lang = "km-KH" so the system TTS engine knows which
 *    language to use even if the specific voice object is missing.
 */
export const createKhmerSpeaker = (text: string): (() => void) => {
  return () => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    // Chrome bug: calling speak() right after cancel() produces no audio.
    window.speechSynthesis.cancel();

    setTimeout(() => {
      getVoices()
        .then((voices) => {
          const utterance = new SpeechSynthesisUtterance(text);

          // Always request Khmer — this is the most important signal
          // for the Android system TTS engine.
          utterance.lang = "km-KH";

          const khmerVoice = pickKhmerVoice(voices);
          if (khmerVoice) {
            utterance.voice = khmerVoice;
          }
          // If no explicit Khmer voice was found, we still set
          // lang = "km-KH" above.  On Android, the Google TTS engine
          // respects the lang tag and will synthesise Khmer even when
          // the voice doesn't appear in getVoices().

          utterance.volume = 1;
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        })
        .catch(() => {
          // Silent fail — never crash the app
        });
    }, 150);
  };
};

/**
 * Directly speaks a Khmer label.
 */
export const speakKhmerLabel = (text: string) => {
  const speak = createKhmerSpeaker(text);
  speak();
};

export const speakRecipe = (recipe: Pick<Recipe, "title_km">) => {
  speakKhmerLabel(recipe.title_km);
};

export const speakCategory = (category: Pick<Category, "name_km">) => {
  speakKhmerLabel(category.name_km);
};
