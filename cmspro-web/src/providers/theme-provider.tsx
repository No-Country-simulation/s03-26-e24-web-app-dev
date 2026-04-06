'use client';

import * as React from 'react';
import { useThemeStore, type Theme, type ResolvedTheme } from '@/stores/theme.store';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: 'class' | 'data-theme';
  defaultTheme?: Theme;
  enableSystem?: boolean;
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function resolveSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(attribute: 'class' | 'data-theme', theme: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  if (attribute === 'class') {
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  } else {
    root.setAttribute(attribute, theme);
  }

  root.style.colorScheme = theme;
}

export function ThemeProvider({
  children,
  attribute = 'data-theme',
  defaultTheme = 'system',
  enableSystem = true,
}: ThemeProviderProps) {
  const theme = useThemeStore((state) => state.theme);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const hydrated = useThemeStore((state) => state.hydrated);
  const setThemeInStore = useThemeStore((state) => state.setTheme);
  const setResolvedTheme = useThemeStore((state) => state.setResolvedTheme);

  React.useEffect(() => {
    if (!hydrated && defaultTheme !== 'system') {
      setThemeInStore(defaultTheme);
    }
  }, [defaultTheme, hydrated, setThemeInStore]);

  React.useEffect(() => {
    const nextResolvedTheme: ResolvedTheme =
      theme === 'system'
        ? enableSystem
          ? resolveSystemTheme()
          : 'light'
        : theme;

    setResolvedTheme(nextResolvedTheme);
    applyTheme(attribute, nextResolvedTheme);
  }, [attribute, enableSystem, setResolvedTheme, theme]);

  React.useEffect(() => {
    if (!enableSystem || theme !== 'system' || typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      const nextResolvedTheme: ResolvedTheme = event.matches ? 'dark' : 'light';
      setResolvedTheme(nextResolvedTheme);
      applyTheme(attribute, nextResolvedTheme);
    };

    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [attribute, enableSystem, setResolvedTheme, theme]);

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeInStore(nextTheme);
    },
    [setThemeInStore]
  );

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [resolvedTheme, setTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
