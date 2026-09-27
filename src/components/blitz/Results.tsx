import type { Ref } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Crown, RotateCcw, Sparkles } from "lucide-react";
import type { TestResult } from "@/lib/blitz/store";
import { BADGES } from "@/lib/blitz/store";
import type { Sample } from "@/lib/blitz/useTypingTest";

type Props = {
  result: TestResult;
  samples: Sample[];
  isPersonalBest: boolean;
  unlocked: string[];
  bonusXp: number;
  onRestart: () => void;
  restartRef?: Ref<HTMLButtonElement>;
};

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 px-5 py-4">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function Results({ result, samples, isPersonalBest, unlocked, bonusXp, onRestart, restartRef }: Props) {
  const chartData = samples
    .filter((_, i) => i % 2 === 1)
    .map((s) => ({ t: s.t, wpm: s.wpm, raw: s.raw, errors: s.errors }));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-16">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">WPM</div>
            <div className="mt-2 text-6xl font-semibold text-foreground">{result.wpm}</div>
            {isPersonalBest && (
              <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary">
                <Crown className="h-4 w-4" /> Personal Best
              </div>
            )}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-accent" />+{result.xp + bonusXp} XP
              {bonusXp > 0 && <span className="text-accent">(+{bonusXp} challenge)</span>}
            </div>
          </div>

          <button
            ref={restartRef}
            type="button"
            onClick={onRestart}
            className="w-full rounded-xl border border-border/50 bg-card/50 px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-card hover:border-border"
          >
            <div className="flex items-center justify-center gap-2">
              <RotateCcw className="h-4 w-4" /> Run Again
            </div>
          </button>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            WPM Progression
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="wpmFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="wpm" stroke="var(--primary)" strokeWidth={2} fill="url(#wpmFill)" />
                <Area type="monotone" dataKey="raw" stroke="var(--accent)" strokeWidth={1} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <Metric label="Raw" value={`${result.raw}`} />
        <Metric label="Accuracy" value={`${result.accuracy}%`} />
        <Metric label="Consistency" value={`${result.consistency}%`} />
        <Metric label="Mode" value={result.mode} sub={`${result.duration}s`} />
        <Metric
          label="Characters"
          value={`${result.correct}/${result.incorrect}/${result.extra}/${result.missed}`}
          sub="correct / wrong / extra / missed"
        />
      </div>

      {unlocked.length > 0 && (
        <div className="mt-6 rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="mb-3 text-sm font-medium text-accent uppercase tracking-wider">Badges Unlocked</div>
          <div className="flex flex-wrap gap-2">
            {unlocked.map((id) => {
              const badge = BADGES.find((b) => b.id === id);
              return (
                <span
                  key={id}
                  className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent"
                >
                  {badge?.name ?? id}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
