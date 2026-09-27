import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { Nav } from "@/components/blitz/Nav";
import { ThemeSync } from "@/components/blitz/ThemeSync";
import { historyStore, profileStore } from "@/lib/blitz/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Blitz Type" },
      { name: "description", content: "Your fastest typing runs, ranked by WPM and stored locally." },
      { property: "og:title", content: "Leaderboard — Blitz Type" },
      { property: "og:description", content: "Your fastest typing runs, ranked by WPM." },
    ],
  }),
  component: Leaderboard,
});

function Leaderboard() {
  const { items } = historyStore.use();
  const profile = profileStore.use();
  const top = [...items].sort((a, b) => b.wpm - a.wpm).slice(0, 20);

  return (
    <div className="min-h-screen">
      <ThemeSync />
      <Nav />
      <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Leaderboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your best typing performances · {profile.name}
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
          {top.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">
                No runs yet. Complete a test to claim the top spot.
              </p>
            </div>
          )}
          {top.map((r, i) => (
            <div
              key={r.id}
              className={cn(
                "flex items-center gap-4 border-b border-border/50 px-6 py-4 last:border-0 transition-colors hover:bg-card/80",
                i === 0 && "bg-primary/5",
              )}
            >
              <div className="w-8 text-center">
                <span className={cn(
                  "text-sm font-medium",
                  i === 0 ? "text-primary" : "text-muted-foreground"
                )}>
                  #{i + 1}
                </span>
              </div>
              {i === 0 ? <Trophy className="h-5 w-5 text-primary" /> : <div className="h-5 w-5" />}
              <div className="w-20">
                <span className={cn(
                  "text-xl font-semibold",
                  i === 0 ? "text-primary" : "text-foreground"
                )}>
                  {r.wpm}
                </span>
              </div>
              <div className="w-16 text-sm text-muted-foreground">{r.accuracy}%</div>
              <div className="w-24 text-sm text-muted-foreground">{r.mode}</div>
              <div className="ml-auto text-sm text-muted-foreground">
                {new Date(r.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
