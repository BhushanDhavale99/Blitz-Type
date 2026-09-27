let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type Click = "key" | "error" | "space" | "finish";

export function playClick(kind: Click = "key") {
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;

  const gain = audio.createGain();
  gain.connect(audio.destination);

  if (kind === "error") {
    const osc = audio.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(140, now);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.13);
    return;
  }

  if (kind === "finish") {
    [523, 659, 880].forEach((f, i) => {
      const osc = audio.createOscillator();
      const g = audio.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, now + i * 0.07);
      g.gain.setValueAtTime(0.0001, now + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.09, now + i * 0.07 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.25);
      osc.connect(g);
      g.connect(audio.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.3);
    });
    return;
  }

  // mechanical switch: short noise burst + click tone
  const length = Math.floor(audio.sampleRate * 0.02);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  }
  const noise = audio.createBufferSource();
  noise.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = kind === "space" ? 900 : 1800;
  filter.Q.value = 1.2;
  gain.gain.setValueAtTime(kind === "space" ? 0.08 : 0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  noise.connect(filter);
  filter.connect(gain);
  noise.start(now);
}
