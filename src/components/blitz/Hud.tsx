import { Target, Timer } from "lucide-react";

type Props = {
  wpm: number;
  accuracy: number;
  remaining: number | null;
  wordsLabel: string;
  streak: number;
  progress: number;
};

export function Hud({ wpm, accuracy, remaining, wordsLabel, streak, progress }: Props) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">WPM</div>
          <div className="mt-1 text-3xl font-semibold text-foreground">{wpm}</div>
        </div>
        <div className="flex flex-col">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Accuracy</div>
          <div className="mt-1 text-3xl font-semibold text-foreground">{accuracy}%</div>
        </div>
        <div className="flex flex-col">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {remaining !== null ? "Time" : "Progress"}
          </div>
          <div className="mt-1 text-3xl font-semibold text-foreground">
            {remaining !== null ? `${remaining}s` : wordsLabel}
          </div>
        </div>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
