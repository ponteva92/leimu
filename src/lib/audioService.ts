/**
 * LEIMU Audio Service — Web Audio API synth (no external files)
 * SSR-safe: all calls are guarded with typeof window checks.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Ambient swoosh: 120Hz → 80Hz sine (~180ms). Hero CTA hover. */
export function playHoverSound(muted: boolean): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.18);
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.035, ac.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.18);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.2);
}

/** Soft wooden click: 90Hz → 30Hz triangle (~100ms). CTA clicks. */
export function playClickSound(muted: boolean): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = "triangle";
  osc.frequency.setValueAtTime(90, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, ac.currentTime + 0.08);
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.055, ac.currentTime + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.1);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.12);
}

/**
 * Ultra-low ambient plop: 55Hz → 35Hz sine (~75ms), very subtle.
 * Subtle UI tick for hover / selection feedback.
 */
export function playPlopSound(muted: boolean): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(55, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(35, ac.currentTime + 0.07);
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(0.022, ac.currentTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.075);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.09);
}

/**
 * Airy modal open whoosh: dual-layer sweep + grounding tone (~240ms).
 * ScentModal open event.
 */
export function playModalOpenSound(muted: boolean): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;

  // Upper layer: airy sine sweep
  const osc1 = ac.createOscillator();
  const gain1 = ac.createGain();
  osc1.connect(gain1);
  gain1.connect(ac.destination);
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(340, ac.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(140, ac.currentTime + 0.24);
  gain1.gain.setValueAtTime(0, ac.currentTime);
  gain1.gain.linearRampToValueAtTime(0.028, ac.currentTime + 0.018);
  gain1.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.24);
  osc1.start(ac.currentTime);
  osc1.stop(ac.currentTime + 0.26);

  // Lower layer: grounding tone
  const osc2 = ac.createOscillator();
  const gain2 = ac.createGain();
  osc2.connect(gain2);
  gain2.connect(ac.destination);
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(80, ac.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(55, ac.currentTime + 0.18);
  gain2.gain.setValueAtTime(0, ac.currentTime);
  gain2.gain.linearRampToValueAtTime(0.032, ac.currentTime + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.2);
  osc2.start(ac.currentTime);
  osc2.stop(ac.currentTime + 0.22);
}
