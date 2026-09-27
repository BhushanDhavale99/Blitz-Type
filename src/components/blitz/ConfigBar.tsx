import { cn } from "@/lib/utils";
import { settingsStore, type Settings } from "@/lib/blitz/store";

const TIMES = [15, 30, 60, 120];
const COUNTS = [10, 25, 50, 100];
const DIFFS = ["easy", "normal", "hard"] as const;

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function ConfigBar({ settings }: { settings: Settings }) {
  const update = (patch: Partial<Settings>) => settingsStore.set((s) => ({ ...s, ...patch }));

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-card/50 p-2">
      <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
        <Chip active={settings.numbers} onClick={() => update({ numbers: !settings.numbers })}>
          #
        </Chip>
        <Chip active={settings.punctuation} onClick={() => update({ punctuation: !settings.punctuation })}>
          @
        </Chip>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
        <Chip active={settings.mode === "time"} onClick={() => update({ mode: "time" })}>
          Time
        </Chip>
        <Chip active={settings.mode === "words"} onClick={() => update({ mode: "words" })}>
          Words
        </Chip>
        <Chip active={settings.mode === "custom"} onClick={() => update({ mode: "custom" })}>
          Custom
        </Chip>
      </div>

      {settings.mode === "time" && (
        <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
          {TIMES.map((t) => (
            <Chip key={t} active={settings.time === t} onClick={() => update({ time: t })}>
              {t}s
            </Chip>
          ))}
        </div>
      )}

      {settings.mode === "words" && (
        <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
          {COUNTS.map((w) => (
            <Chip key={w} active={settings.words === w} onClick={() => update({ words: w })}>
              {w}
            </Chip>
          ))}
        </div>
      )}

      {settings.mode === "custom" && (
        <span className="px-3 text-sm text-muted-foreground hidden sm:inline">Edit text in settings</span>
      )}

      <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
        {DIFFS.map((d) => (
          <Chip key={d} active={settings.difficulty === d} onClick={() => update({ difficulty: d })}>
            {d}
          </Chip>
        ))}
      </div>
    </div>
  );
}
