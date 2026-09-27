import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateWords, wordsFromCustomText } from "./words";
import { playClick } from "./sound";
import type { Settings, TestResult } from "./store";

export type Phase = "idle" | "running" | "finished";

export type Sample = { t: number; wpm: number; raw: number; errors: number };

const WORD_BUFFER = 120;
const MAX_EXTRA = 20;

function makeWords(settings: Settings) {
  if (settings.mode === "custom" && settings.customText.trim()) {
    return wordsFromCustomText(settings.customText);
  }
  const count = settings.mode === "words" ? settings.words : WORD_BUFFER;
  return generateWords(count, {
    difficulty: settings.difficulty,
    numbers: settings.numbers,
    punctuation: settings.punctuation,
  });
}

/** Settings that must regenerate the prompt. Theme/sound/caret must not. */
function promptKey(s: Settings) {
  return [s.mode, s.time, s.words, s.difficulty, s.numbers, s.punctuation, s.customText].join("\0");
}

export function computeStats(
  typed: string[],
  words: string[],
  index: number,
  elapsed: number,
  keystrokes: { correct: number; total: number },
) {
  let correct = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;
  typed.forEach((t, i) => {
    const target = words[i] ?? "";
    const isSubmitted = i < index;
    for (let c = 0; c < t.length; c++) {
      if (c < target.length) {
        if (t[c] === target[c]) correct++;
        else incorrect++;
      } else extra++;
    }
    if (isSubmitted && t.length < target.length) missed += target.length - t.length;
    if (isSubmitted) correct += 1; // space
  });
  const minutes = Math.max(elapsed, 0.001) / 60;
  const typedChars = correct + incorrect + extra;
  const liveMinutes = Math.max(elapsed, 0.5) / 60;
  const wpm =
    elapsed < 0.5 ? 0 : Math.max(0, Math.round(correct / 5 / liveMinutes));
  const raw =
    elapsed < 0.5 ? 0 : Math.max(0, Math.round(typedChars / 5 / liveMinutes));
  const accuracy = keystrokes.total ? Math.round((keystrokes.correct / keystrokes.total) * 100) : 100;
  return { correct, incorrect, extra, missed, wpm, raw, accuracy, typedChars };
}

function isEditableField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.dataset.blitzInput !== undefined) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

export function useTypingTest(settings: Settings, onFinish: (r: TestResult, samples: Sample[]) => void) {
  const [words, setWords] = useState<string[]>([]);
  const [typed, setTyped] = useState<string[]>([""]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);

  const startRef = useRef<number | null>(null);
  const keystrokes = useRef<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const samples = useRef<Sample[]>([]);
  const finishedRef = useRef(false);

  const wordsRef = useRef(words);
  const typedRef = useRef(typed);
  const indexRef = useRef(index);
  const phaseRef = useRef(phase);
  const settingsRef = useRef(settings);
  const onFinishRef = useRef(onFinish);

  wordsRef.current = words;
  typedRef.current = typed;
  indexRef.current = index;
  phaseRef.current = phase;
  settingsRef.current = settings;
  onFinishRef.current = onFinish;

  const limitSeconds = settings.mode === "time" ? settings.time : 0;

  const syncWords = (next: string[]) => {
    wordsRef.current = next;
    setWords(next);
  };
  const syncTyped = (next: string[]) => {
    typedRef.current = next;
    setTyped(next);
  };
  const syncIndex = (next: number) => {
    indexRef.current = next;
    setIndex(next);
  };
  const syncPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const reset = useCallback(() => {
    const nextWords = makeWords(settingsRef.current);
    syncWords(nextWords);
    syncTyped([""]);
    syncIndex(0);
    syncPhase("idle");
    setElapsed(0);
    startRef.current = null;
    keystrokes.current = { correct: 0, total: 0 };
    samples.current = [];
    finishedRef.current = false;
  }, []);

  const prompt = promptKey(settings);
  useEffect(() => {
    reset();
  }, [prompt, reset]);

  const stats = useMemo(
    () => computeStats(typed, words, index, elapsed, keystrokes.current),
    [typed, words, index, elapsed],
  );

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    if (phaseRef.current === "idle") return;
    finishedRef.current = true;

    const duration = startRef.current ? (performance.now() - startRef.current) / 1000 : elapsed;
    const s = computeStats(typedRef.current, wordsRef.current, indexRef.current, duration, keystrokes.current);
    const minutes = Math.max(duration, 0.5) / 60;
    const wpm = Math.max(0, Math.round(s.correct / 5 / minutes));
    const raw = Math.max(0, Math.round(s.typedChars / 5 / minutes));
    const series = samples.current.map((x) => x.wpm).filter((x) => x > 0);
    const mean = series.reduce((a, b) => a + b, 0) / (series.length || 1);
    const variance = series.reduce((a, b) => a + (b - mean) ** 2, 0) / (series.length || 1);
    const consistency =
      series.length > 1 ? Math.max(0, Math.round(100 - (Math.sqrt(variance) / (mean || 1)) * 100)) : 100;
    const xp = Math.round(wpm * (s.accuracy / 100) * 2 + duration * 1.5);
    const cfg = settingsRef.current;

    const result: TestResult = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: Date.now(),
      wpm,
      raw,
      accuracy: s.accuracy,
      consistency,
      mode:
        cfg.mode === "time"
          ? `${cfg.time}s`
          : cfg.mode === "words"
            ? `${cfg.words} words`
            : "custom",
      duration: Math.max(1, Math.round(duration)),
      correct: s.correct,
      incorrect: s.incorrect,
      extra: s.extra,
      missed: s.missed,
      xp,
    };
    syncPhase("finished");
    if (cfg.sound) playClick("finish");
    onFinishRef.current(result, samples.current);
  }, []);

  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => {
      const start = startRef.current;
      if (!start) return;
      const secs = (performance.now() - start) / 1000;
      setElapsed(secs);
      const s = computeStats(typedRef.current, wordsRef.current, indexRef.current, secs, keystrokes.current);
      samples.current = [
        ...samples.current,
        { t: Math.round(secs * 10) / 10, wpm: s.wpm, raw: s.raw, errors: s.incorrect },
      ];
      const limit = settingsRef.current.mode === "time" ? settingsRef.current.time : 0;
      if (limit && secs >= limit) finishRef.current();
    }, 250);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isEditableField(e.target)) return;
      if (phaseRef.current === "finished") return;

      const key = e.key;
      if (key === "Escape" || key === "Tab" || key === "Enter") return;

      const isChar = key.length === 1;
      const isBackspace = key === "Backspace";
      if (!isChar && !isBackspace) return;
      if (isChar && (e.ctrlKey || e.metaKey)) return;

      const cfg = settingsRef.current;
      let wordList = wordsRef.current;
      let typedWords = typedRef.current;
      let i = indexRef.current;

      if (isChar || isBackspace) {
        e.preventDefault();
      }

      if (wordList.length === 0) return;

      if (phaseRef.current === "idle") {
        if (isBackspace) return;
        if (key === " ") return;
        startRef.current = performance.now();
        syncPhase("running");
        setElapsed(0);
      }

      if (isBackspace) {
        const cur = typedWords[i] ?? "";
        const clearWord = e.ctrlKey || e.metaKey || e.altKey;
        if (cur.length === 0) {
          if (i > 0) {
            const prev = i - 1;
            const nextTyped = [...typedWords];
            if (clearWord) nextTyped[prev] = "";
            syncTyped(nextTyped);
            syncIndex(prev);
          }
          return;
        }
        const nextTyped = [...typedWords];
        nextTyped[i] = clearWord ? "" : cur.slice(0, -1);
        syncTyped(nextTyped);
        return;
      }

      if (key === " ") {
        const cur = typedWords[i] ?? "";
        if (cur.length === 0) return;
        if (cfg.sound) playClick("space");
        keystrokes.current.total++;
        keystrokes.current.correct++;
        const nextIndex = i + 1;
        const nextTyped = [...typedWords];
        if (nextTyped[nextIndex] === undefined) nextTyped[nextIndex] = "";
        syncTyped(nextTyped);
        syncIndex(nextIndex);
        if (cfg.mode !== "time" && nextIndex >= wordList.length) {
          finishRef.current();
        }
        return;
      }

      const target = wordList[i] ?? "";
      const cur = typedWords[i] ?? "";
      if (cur.length - target.length >= MAX_EXTRA) return;

      const correct = target[cur.length] === key;
      keystrokes.current.total++;
      if (correct) keystrokes.current.correct++;
      if (cfg.sound) playClick(correct ? "key" : "error");

      const nextTyped = [...typedWords];
      nextTyped[i] = (nextTyped[i] ?? "") + key;
      syncTyped(nextTyped);

      if (cfg.mode !== "time" && i >= wordList.length - 1 && nextTyped[i].length >= target.length && target.length > 0) {
        syncIndex(i + 1);
        finishRef.current();
        return;
      }

      if (cfg.mode === "time" && i >= wordList.length - 25) {
        const extraWords = generateWords(40, {
          difficulty: cfg.difficulty,
          numbers: cfg.numbers,
          punctuation: cfg.punctuation,
        });
        syncWords([...wordList, ...extraWords]);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const remaining = limitSeconds ? Math.max(0, Math.ceil(limitSeconds - elapsed)) : null;

  return {
    words,
    typed,
    index,
    phase,
    stats,
    elapsed,
    remaining,
    reset,
    finish,
    progress:
      settings.mode === "time"
        ? limitSeconds
          ? Math.min(1, elapsed / limitSeconds)
          : 0
        : Math.min(1, index / Math.max(1, words.length)),
  };
}
