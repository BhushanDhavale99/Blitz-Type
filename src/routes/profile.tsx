import { createFileRoute } from "@tanstack/react-router";
import { Award, Flame } from "lucide-react";
import { Nav } from "@/components/blitz/Nav";
import { ThemeSync } from "@/components/blitz/ThemeSync";
import { BADGES, dailyChallenge, historyStore, levelFromXp, profileStore, todayKey } from "@/lib/blitz/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Blitz Type" },
      { name: "description", content: "Your level, XP progress, streak, daily challenge and unlocked badges." },
      { property: "og:title", content: "Profile — Blitz Type" },
      { property: "og:description", content: "Level, XP, streak and badges in Blitz Type." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const profile = profileStore.use();
  const { items } = historyStore.use();
  const level = levelFromXp(profile.xp);
  const challenge = dailyChallenge();
  const done = profile.dailyChallengeDone === todayKey();

  return (
    <div className="min-h-screen">
      <ThemeSync />
      <Nav />
      <main className="mx-auto w-full max-w-4xl px-6 pb-16 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your progress, achievements, and statistics
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <input
                value={profile.name}
                onChange={(e) => profileStore.set((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-transparent text-2xl font-semibold text-foreground outline-none"
                aria-label="Player name"
              />
              <div className="mt-1 text-sm text-muted-foreground">
                Level {level.level} · {level.title}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-accent">
              <Flame className="h-5 w-5" /> {profile.streak} day streak
            </div>
          </div>

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round(level.progress * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>{profile.xp} XP</span>
            <span>{level.toNext} XP to next level</span>
            <span>{items.length} tests</span>
            <span>Best {profile.bestWpm} WPM</span>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Award className="h-4 w-4 text-accent" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Daily Challenge</div>
                <div className="text-xs text-muted-foreground">{challenge.label}</div>
              </div>
            </div>
            <div className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium",
              done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}>
              {done ? "Complete (+150 XP)" : "Pending"}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Badges
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BADGES.map((b) => {
              const owned = profile.badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                    owned ? "border-accent/20 bg-accent/5" : "border-border/50 opacity-50",
                  )}
                >
                  <Award className={cn("h-5 w-5 flex-shrink-0", owned ? "text-accent" : "text-muted-foreground")} />
                  <div>
                    <div className="text-sm font-medium text-foreground">{b.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{b.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
