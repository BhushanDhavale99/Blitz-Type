import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/blitz/Nav";
import { ThemeSync } from "@/components/blitz/ThemeSync";
import { settingsStore, type ThemeName } from "@/lib/blitz/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Blitz Type" },
      { name: "description", content: "Choose a neon theme, toggle sound and caret behaviour, and set custom text." },
      { property: "og:title", content: "Settings — Blitz Type" },
      { property: "og:description", content: "Themes, sound effects, caret behaviour and custom practice text." },
    ],
  }),
  component: SettingsPage,
});

const THEMES: { id: ThemeName; label: string }[] = [
  { id: "cyberpunk", label: "Professional" },
  { id: "synthwave", label: "Synthwave" },
  { id: "matrix", label: "Matrix" },
  { id: "stealth", label: "Stealth Dark" },
  { id: "light", label: "Light Mode" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 px-6 py-4 last:border-0">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-6 w-11 rounded-full border border-border/50 p-0.5 transition-colors",
        on ? "bg-primary border-primary" : "bg-secondary",
      )}
    >
      <span
        className={cn(
          "block h-5 w-5 rounded-full transition-transform",
          on ? "translate-x-5 bg-white" : "bg-muted-foreground",
        )}
      />
    </button>
  );
}

function SettingsPage() {
  const settings = settingsStore.use();
  const update = (patch: Partial<typeof settings>) => settingsStore.set((s) => ({ ...s, ...patch }));

  return (
    <div className="min-h-screen">
      <ThemeSync />
      <Nav />
      <main className="mx-auto w-full max-w-3xl px-6 pb-16 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Customize your typing experience
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-border/50 bg-card/50">
          <div className="border-b border-border/50 px-6 py-3">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Appearance
            </div>
          </div>
          <Row label="Theme">
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ theme: t.id })}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    settings.theme === t.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Sound Effects">
            <Toggle on={settings.sound} onClick={() => update({ sound: !settings.sound })} />
          </Row>
          <Row label="Smooth Caret">
            <Toggle on={settings.smoothCaret} onClick={() => update({ smoothCaret: !settings.smoothCaret })} />
          </Row>
        </div>

        <div className="mb-6 rounded-xl border border-border/50 bg-card/50">
          <div className="border-b border-border/50 px-6 py-3">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Test Options
            </div>
          </div>
          <Row label="Numbers">
            <Toggle on={settings.numbers} onClick={() => update({ numbers: !settings.numbers })} />
          </Row>
          <Row label="Punctuation">
            <Toggle on={settings.punctuation} onClick={() => update({ punctuation: !settings.punctuation })} />
          </Row>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Custom Text
          </div>
          <textarea
            value={settings.customText}
            onChange={(e) => update({ customText: e.target.value })}
            rows={5}
            placeholder="Paste any text to practice with, then pick 'custom' in the test bar."
            className="w-full rounded-lg border border-border/50 bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </main>
    </div>
  );
}
