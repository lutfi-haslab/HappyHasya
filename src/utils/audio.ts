let audioCtx: AudioContext | null = null;

async function ensureAudioContext(): Promise<AudioContext> {
  if (!audioCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  return audioCtx;
}

export function playTapSound() {
  ensureAudioContext().then((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }).catch((e) => console.error('Audio tap failed', e));
}

export function playSuccessSound() {
  ensureAudioContext().then((ctx) => {
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.linearRampToValueAtTime(0, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }).catch(console.error);
}

export function playWrongSound() {
  ensureAudioContext().then((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.25);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  }).catch(console.error);
}

export function playStickerSound() {
  ensureAudioContext().then((ctx) => {
    const now = ctx.currentTime;
    const freqs = [587.33, 659.25, 783.99, 880.00, 1046.50];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.1, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.45);
    });
  }).catch(console.error);
}

export function playBubblePopSound() {
  ensureAudioContext().then((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  }).catch(console.error);
}

export function playBalloonPopSound() {
  ensureAudioContext().then((ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }).catch(console.error);
}

export function playChompSound() {
  ensureAudioContext().then((ctx) => {
    const now = ctx.currentTime;
    [0, 0.12].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now + offset);
      osc.frequency.exponentialRampToValueAtTime(80, now + offset + 0.08);

      gain.gain.setValueAtTime(0.15, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.12);
    });
  }).catch(console.error);
}

export function playDiscoverSound() {
  ensureAudioContext().then((ctx) => {
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.15, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.3);
    });
  }).catch(console.error);
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let speakTimeoutId: ReturnType<typeof setTimeout> | null = null;
let lastSpokenText = '';

// Track active utterances globally to prevent early garbage collection in Chrome/browsers
const activeUtterances = new Set<SpeechSynthesisUtterance>();

function cacheVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  if (voices.length) {
    cachedVoices = voices;
    console.log('[TTS] Voices cached:', voices.length, voices.map(v => `${v.name}(${v.lang})`));
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  console.log('[TTS] speechSynthesis available, loading voices...');
  cacheVoices();
  speechSynthesis.onvoiceschanged = () => {
    console.log('[TTS] onvoiceschanged fired');
    cacheVoices();
  };
} else {
  console.warn('[TTS] speechSynthesis NOT available in this browser');
}

let workingLang: 'id-ID' | 'ms-MY' | 'en-US' | null = null;
let fallbackTimeoutId: ReturnType<typeof setTimeout> | null = null;
let activeAudio: HTMLAudioElement | null = null;

function getVoiceForLang(langCode: 'id-ID' | 'ms-MY' | 'en-US') {
  if (!cachedVoices.length) return null;
  
  if (langCode === 'id-ID') {
    return cachedVoices.find((v) => v.lang.toLowerCase().startsWith('id'));
  } else if (langCode === 'ms-MY') {
    return cachedVoices.find((v) => v.lang.toLowerCase().startsWith('ms') || v.name.toLowerCase().includes('amira'));
  } else {
    return cachedVoices.find((v) => v.lang.toLowerCase().startsWith('en-us') || v.name.toLowerCase().includes('samantha'));
  }
}

export function speakIndonesian(text: string) {
  console.log('[TTS] speakIndonesian called with:', JSON.stringify(text));

  // 1. Try playing via Google Translate APIs endpoint (100% reliable, loose CORS, client=gtx is unrestricted and never blocks localhost)
  try {
    if (activeAudio) {
      console.log('[TTS] Pausing previously active audio playback...');
      activeAudio.pause();
      activeAudio = null;
    }

    // Google Translate TTS endpoint on googleapis.com (client=gtx never gets rate-limited or blocked on localhost)
    const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=id&client=gtx`;
    const audio = new Audio(ttsUrl);
    activeAudio = audio;

    audio.onplay = () => {
      console.log('[TTS] HTML5 Audio TTS successfully started playing!');
    };

    audio.onerror = (e) => {
      console.warn('[TTS] HTML5 Audio TTS encountered error, falling back to Web Speech Synthesis:', e);
      triggerWebSpeechFallback(text);
    };

    audio.play().catch((err) => {
      console.warn('[TTS] Audio play() blocked or failed, falling back to Web Speech Synthesis:', err);
      triggerWebSpeechFallback(text);
    });
  } catch (err) {
    console.warn('[TTS] Exception in HTML5 Audio TTS, falling back to Web Speech Synthesis:', err);
    triggerWebSpeechFallback(text);
  }
}

function triggerWebSpeechFallback(text: string) {
  if (speakTimeoutId) {
    clearTimeout(speakTimeoutId);
    speakTimeoutId = null;
  }

  if (fallbackTimeoutId) {
    clearTimeout(fallbackTimeoutId);
    fallbackTimeoutId = null;
  }

  speakTimeoutId = setTimeout(() => {
    speakTimeoutId = null;
    lastSpokenText = text;

    const targetLang = workingLang || 'id-ID';
    attemptSpeech(text, targetLang);
  }, 50);
}

function attemptSpeech(text: string, langCode: 'id-ID' | 'ms-MY' | 'en-US') {
  const synth = window.speechSynthesis;
  
  try {
    // 1. Cleanly cancel preceding speech
    synth.cancel();

    if (synth.paused) {
      synth.resume();
    }

    // 2. Create the utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;

    // Hold a strong reference to the utterance to prevent early garbage collection in Chrome
    activeUtterances.add(utterance);

    // 3. Find and bind the best available voice for this language
    const voice = getVoiceForLang(langCode);
    if (voice) {
      console.log(`[TTS] Selected fallback voice for ${langCode}:`, voice.name, voice.lang);
      utterance.voice = voice;
    } else {
      console.warn(`[TTS] No fallback voice found for ${langCode}, using browser default`);
    }

    utterance.pitch = langCode === 'en-US' ? 1.1 : 1.25;
    utterance.rate = langCode === 'en-US' ? 0.9 : 0.95;
    utterance.volume = 1.0;

    let hasStarted = false;

    utterance.onstart = () => {
      hasStarted = true;
      if (fallbackTimeoutId) {
        clearTimeout(fallbackTimeoutId);
        fallbackTimeoutId = null;
      }
      if (!workingLang) {
        console.log(`[TTS] Success! Lock-in working fallback voice: ${langCode}`);
        workingLang = langCode;
      }
      console.log(`[TTS] Fallback speech STARTED [${langCode}]:`, text.substring(0, 30));
    };

    utterance.onend = () => {
      console.log(`[TTS] Fallback speech ENDED [${langCode}]:`, text.substring(0, 30));
      activeUtterances.delete(utterance);
    };

    utterance.onerror = (e) => {
      console.error(`[TTS] Fallback speech ERROR [${langCode}]:`, e.error, text.substring(0, 30));
      activeUtterances.delete(utterance);
      
      if (e.error === 'interrupted' || e.error === 'not-allowed') {
        synth.resume();
      }
    };

    // 4. Set a safety diagnostic fallback timer if workingLang is not yet proven
    if (!workingLang) {
      console.log(`[TTS] Setting safety fallback timer (3500ms) for fallback language: ${langCode}`);
      fallbackTimeoutId = setTimeout(() => {
        fallbackTimeoutId = null;
        if (!hasStarted) {
          console.warn(`[TTS] Fallback speech did NOT start within 3500ms using: ${langCode}.`);
          
          activeUtterances.delete(utterance);
          synth.cancel();
          
          if (langCode === 'id-ID') {
            console.log('[TTS] Falling back: id-ID -> ms-MY (Malay)');
            attemptSpeech(text, 'ms-MY');
          } else if (langCode === 'ms-MY') {
            console.log('[TTS] Falling back: ms-MY -> en-US (English)');
            attemptSpeech(text, 'en-US');
          }
        }
      }, 3500);
    }

    console.log(`[TTS] Speaking now fallback... [${langCode}]`, { text: text.substring(0, 40) });
    synth.speak(utterance);
    synth.resume();
  } catch (err) {
    console.error('[TTS] Exception in fallback attemptSpeech:', err);
  }
}
