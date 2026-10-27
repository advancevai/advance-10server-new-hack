import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('winpro_theme') as 'dark' | 'light' | null;
      if (stored) {
        setTheme(stored);
        applyTheme(stored);
      } else {
        applyTheme('dark');
      }
    } catch {
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (t: 'dark' | 'light') => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(t);
  };

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem('winpro_theme', next);
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      type="button"
      className="grid size-9 place-items-center rounded-xl border border-border bg-secondary/50 text-foreground transition-all hover:border-primary active:scale-95"
    >
      {theme === 'dark' ? (
        <Sun className="size-4 text-amber-400" />
      ) : (
        <Moon className="size-4 text-cyan-600" />
      )}
    </button>
  );
}
