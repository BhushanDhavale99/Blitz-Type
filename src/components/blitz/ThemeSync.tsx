import { useEffect } from "react";
import { settingsStore } from "@/lib/blitz/store";

const CLASSES = ["theme-cyberpunk", "theme-synthwave", "theme-matrix", "theme-stealth"];

export function ThemeSync() {
  const settings = settingsStore.use();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...CLASSES);
    root.classList.add(`theme-${settings.theme}`);
  }, [settings.theme]);

  return null;
}
