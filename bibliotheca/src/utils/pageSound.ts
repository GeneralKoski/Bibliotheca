const ENABLED_KEY = "bibliotheca:pageSound";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const C =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!C) return null;
  if (!ctx) {
    try {
      ctx = new C();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function isPageSoundEnabled(): boolean {
  try {
    return localStorage.getItem(ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setPageSoundEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(ENABLED_KEY, "1");
    else localStorage.removeItem(ENABLED_KEY);
  } catch {
    // ignore
  }
}

function makeNoiseBuffer(c: AudioContext, durationSec: number): AudioBuffer {
  const length = Math.floor(c.sampleRate * durationSec);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Layered paper page-flip:
 *   1. low whoosh — noise lowpass swept down, ~220ms (the "fwwhh")
 *   2. high crinkle — short noise highpass burst, ~70ms (the paper edge)
 *   3. tiny tap   — sine ping at ~120Hz, settling thump
 */
export function playPageFlip(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    c.resume().catch(() => {});
  }
  const now = c.currentTime;

  // 1. Whoosh
  {
    const dur = 0.22;
    const src = c.createBufferSource();
    src.buffer = makeNoiseBuffer(c, dur);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(2200, now);
    lp.frequency.exponentialRampToValueAtTime(420, now + dur);
    lp.Q.value = 0.7;
    const g = c.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.32, now + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(lp);
    lp.connect(g);
    g.connect(c.destination);
    src.start(now);
    src.stop(now + dur + 0.05);
  }

  // 2. High-frequency crinkle
  {
    const dur = 0.08;
    const start = now + 0.005;
    const src = c.createBufferSource();
    src.buffer = makeNoiseBuffer(c, dur);
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3500;
    const g = c.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.18, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(hp);
    hp.connect(g);
    g.connect(c.destination);
    src.start(start);
    src.stop(start + dur + 0.02);
  }

  // 3. Tiny low thump at the end (page settles)
  {
    const start = now + 0.18;
    const dur = 0.09;
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, start);
    osc.frequency.exponentialRampToValueAtTime(80, start + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.12, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }
}
