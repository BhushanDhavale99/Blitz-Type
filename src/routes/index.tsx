import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Nav } from "@/components/blitz/Nav";
import { ConfigBar } from "@/components/blitz/ConfigBar";
import { WordDisplay } from "@/components/blitz/WordDisplay";
import { Hud } from "@/components/blitz/Hud";
import { Results } from "@/components/blitz/Results";
import { ThemeSync } from "@/components/blitz/ThemeSync";
import { useTypingTest, type Sample } from "@/lib/blitz/useTypingTest";
import {
  dailyChallenge,
  levelFromXp,
  profileStore,
  recordResult,
  settingsStore,
  todayKey,
  type TestResult,
} from "@/lib/blitz/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blitz Type — Professional Typing Speed Test" },
      {
        name: "description",
        content:
          "Test your typing speed with accurate WPM tracking, detailed statistics, and progress tracking.",
      },
      { property: "og:title", content: "Blitz Type — Professional Typing Speed Test" },
      {
        property: "og:description",
        content: "Professional typing speed tester with live WPM, accuracy tracking, and detailed statistics.",
      },
    ],
  }),
  component: Practice,
});

function Practice() {
  const settings = settingsStore.use();
  const profile = profileStore.use();
  const [finished, setFinished] = useState<{
    result: TestResult;
    samples: Sample[];
    unlocked: string[];
    bonusXp: number;
    isPersonalBest: boolean;
  } | null>(null);
  const restartHint = useRef<HTMLInputElement>(null);

  const handleFinish = useCallback((result: TestResult, samples: Sample[]) => {
    const meta = recordResult(result);
    setFinished({ result, samples, ...meta });
  }, []);

  const test = useTypingTest(settings, handleFinish);
  const { reset } = test;

  const restartBtn = useRef<HTMLButtonElement>(null);

  const restart = useCallback(() => {
    setFinished(null);
    reset();
  }, [reset]);

  useEffect(() => {
    if (!finished) {
      setTimeout(() => restartHint.current?.focus(), 0);
    }
  }, [finished, test.phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        restartBtn.current?.focus();
        return;
      }
      if (e.key === "Escape" && (test.phase !== "idle" || finished)) {
        e.preventDefault();
        restart();
        return;
      }
      if (e.key === "Enter") {
        const armed = restartBtn.current != null && document.activeElement === restartBtn.current;
        if (finished || armed) {
          e.preventDefault();
          restart();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [restart, test.phase, finished]);

  const challenge = dailyChallenge();
  const level = levelFromXp(profile.xp);
  const done = profile.dailyChallengeDone === todayKey();

  return (
    <div className="min-h-screen">
      <ThemeSync />
      <Nav />

      {finished ? (
        <Results
          result={finished.result}
          samples={finished.samples}
          unlocked={finished.unlocked}
          bonusXp={finished.bonusXp}
          isPersonalBest={finished.isPersonalBest}
          onRestart={restart}
          restartRef={restartBtn}
        />
      ) : (
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <ConfigBar settings={settings} />
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="text-sm font-medium text-muted-foreground">Daily Challenge</span>
              </div>
              <div className="h-4 w-px bg-border/50" />
              <span className="text-sm text-foreground">{challenge.label}</span>
              <span className={done ? "text-sm font-medium text-primary" : "text-sm text-muted-foreground"}>
                {done ? "✓" : "○"}
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-4">
              <Hud
                wpm={test.stats.wpm}
                accuracy={test.stats.accuracy}
                remaining={test.remaining}
                wordsLabel={`${test.index}/${test.words.length}`}
                streak={profile.streak}
                progress={test.progress}
              />

              <div
                onClick={() => restartHint.current?.focus()}
                className="min-h-[200px] cursor-text rounded-2xl border border-border/50 bg-card/50 p-6 sm:p-8 transition-colors hover:border-border/80"
              >
                <WordDisplay
                  words={test.words}
                  typed={test.typed}
                  index={test.index}
                  smoothCaret={settings.smoothCaret}
                />
              </div>

              <input
                ref={restartHint}
                data-blitz-input=""
                className="sr-only"
                aria-label="Typing input"
                autoFocus
                autoComplete="off"
                onChange={() => undefined}
                value=""
              />
            </div>

            <div className="flex flex-col gap-4 lg:w-48">
              <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                <div className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Level {level.level}
                </div>
                <div className="mb-2 text-lg font-semibold text-foreground">{level.title}</div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${Math.round(level.progress * 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{level.toNext} XP to next</div>
              </div>

              <button
                ref={restartBtn}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={restart}
                className="w-full rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-card hover:border-border"
              >
                Restart Test
              </button>

              <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                <div className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Streak
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-accent">{profile.streak}</span>
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="rounded border border-border/50 bg-secondary px-1.5 py-0.5 font-mono text-[0.7rem]">Tab</kbd> + <kbd className="rounded border border-border/50 bg-secondary px-1.5 py-0.5 font-mono text-[0.7rem]">Enter</kbd> or <kbd className="rounded border border-border/50 bg-secondary px-1.5 py-0.5 font-mono text-[0.7rem]">Esc</kbd> to restart · <kbd className="rounded border border-border/50 bg-secondary px-1.5 py-0.5 font-mono text-[0.7rem]">Ctrl</kbd> + <kbd className="rounded border border-border/50 bg-secondary px-1.5 py-0.5 font-mono text-[0.7rem]">Backspace</kbd> clears word
            </p>
          </div>
        </main>
      )}
    </div>
  );
}
