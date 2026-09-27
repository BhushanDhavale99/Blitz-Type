import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Nav } from "@/components/blitz/Nav";
import { ThemeSync } from "@/components/blitz/ThemeSync";
import { historyStore } from "@/lib/blitz/store";

export const Route = createFileRoute("/statistics")({
  head: () => ({
    meta: [
      { title: "Statistics — Blitz Type" },
      { name: "description", content: "Track WPM trends, accuracy averages and your full typing test history." },
      { property: "og:title", content: "Statistics — Blitz Type" },
      { property: "og:description", content: "WPM trends, accuracy averages and full test history." },
    ],
  }),
  component: Statistics,
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 px-5 py-4">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Statistics() {
  const { items } = historyStore.use();
  const avg = (fn: (r: (typeof items)[number]) => number) =>
    items.length ? Math.round(items.reduce((a, b) => a + fn(b), 0) / items.length) : 0;

  const data = [...items]
    .slice(0, 30)
    .reverse()
    .map((r, i) => ({ run: i + 1, wpm: r.wpm, accuracy: r.accuracy }));

  return (
    <div className="min-h-screen">
      <ThemeSync />
      <Nav />
      <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Statistics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your typing performance over time
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Total Tests" value={`${items.length}`} />
          <Stat label="Average WPM" value={`${avg((r) => r.wpm)}`} />
          <Stat label="Average Accuracy" value={`${avg((r) => r.accuracy)}%`} />
          <Stat label="Best WPM" value={`${items.reduce((a, b) => Math.max(a, b.wpm), 0)}`} />
        </div>

        <div className="mb-6 rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Last 30 Runs
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="run" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="wpm" stroke="var(--primary)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="accuracy" stroke="var(--accent)" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
          <div className="border-b border-border/50 px-6 py-3">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Recent History
            </div>
          </div>
          {items.slice(0, 25).map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 border-b border-border/50 px-6 py-3 last:border-0 text-sm"
            >
              <div className="w-16 font-medium text-foreground">{r.wpm} WPM</div>
              <div className="w-16 text-muted-foreground">{r.accuracy}%</div>
              <div className="w-20 text-muted-foreground">{r.consistency}%</div>
              <div className="w-24 text-muted-foreground">{r.mode}</div>
              <div className="ml-auto text-muted-foreground">
                {new Date(r.date).toLocaleDateString()}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No history yet. Complete some tests to see your statistics.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
