import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  words: string[];
  typed: string[];
  index: number;
  smoothCaret: boolean;
  blurred?: boolean;
};

export function WordDisplay({ words, typed, index, smoothCaret, blurred }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);
  const caretHostRef = useRef<HTMLSpanElement>(null);
  const [caret, setCaret] = useState({ x: 0, y: 0, h: 32 });
  const [offset, setOffset] = useState(0);

  useLayoutEffect(() => {
    const active = activeRef.current;
    if (!active) {
      setOffset(0);
      return;
    }
    if (index === 0) {
      setOffset(0);
      return;
    }
    const lineTop = active.offsetTop;
    setOffset(lineTop > 80 ? lineTop - 48 : 0);
  }, [index, words, typed]);

  useLayoutEffect(() => {
    const host = caretHostRef.current;
    const content = contentRef.current;
    if (!host || !content) return;
    const hb = host.getBoundingClientRect();
    const cb = content.getBoundingClientRect();
    setCaret({ x: hb.left - cb.left, y: hb.top - cb.top, h: hb.height || 32 });
  }, [typed, index, words, offset]);

  const visible = words.slice(0, Math.max(index + 60, 80));

  return (
    <div
      className={cn(
        "relative mx-auto h-[12rem] w-full overflow-hidden px-6 transition-all",
        blurred && "blur-sm opacity-60",
      )}
      ref={containerRef}
    >
      <div
        ref={contentRef}
        className="relative font-mono text-[1.5rem] leading-[2.5rem] tracking-wide transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-${offset}px)` }}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-10 w-[1.5px] rounded-full bg-foreground",
            smoothCaret ? "transition-all duration-150 ease-out" : "",
            "caret-blink",
            "caret-pulse",
          )}
          style={{ 
            transform: `translate(${caret.x}px, ${caret.y}px)`, 
            height: caret.h,
            boxShadow: "0 0 1px var(--accent), 0 0 4px var(--accent / 0.6)"
          }}
        />
        {visible.map((word, wi) => {
          const input = typed[wi] ?? "";
          const isActive = wi === index;
          const isDone = wi < index;
          const hasError = isDone && input !== word;
          const extras = input.length > word.length ? input.slice(word.length) : "";
          const caretAtEnd = isActive && input.length >= word.length;
          return (
            <span
              key={wi}
              ref={isActive ? activeRef : undefined}
              className={cn(
                "mr-[1em] inline-block",
                isActive && "rounded-md bg-primary/10 px-1.5 py-0.5 transition-colors duration-150",
                hasError && "text-destructive",
              )}
            >
              {word.split("").map((ch, ci) => {
                const t = input[ci];
                const state = t === undefined ? "pending" : t === ch ? "correct" : "wrong";
                return (
                  <span key={ci} className="relative">
                    {isActive && ci === input.length && (
                      <span ref={caretHostRef} className="absolute inset-y-0 left-0 w-0" />
                    )}
                    <span
                      className={cn(
                        state === "pending" && "text-muted-foreground/50",
                        state === "correct" && "text-foreground",
                        state === "wrong" && "text-destructive",
                        isActive && ci === input.length && "text-primary font-medium",
                      )}
                    >
                      {ch}
                    </span>
                  </span>
                );
              })}
              {extras.split("").map((ch, ci) => (
                <span key={`x${ci}`} className="relative text-destructive/60">
                  {ch}
                </span>
              ))}
              {caretAtEnd && <span ref={caretHostRef} className="inline-block w-0" />}
            </span>
          );
        })}
      </div>
    </div>
  );
}
