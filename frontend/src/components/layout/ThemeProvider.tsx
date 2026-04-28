"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}>({ theme: "system", setTheme: () => {}, toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("grs-theme") as Theme;
    if (saved) {
      setThemeState(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    
    const applyTheme = (t: "dark" | "light") => {
      if (t === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    };

    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(isDark ? "dark" : "light");
      
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? "dark" : "light");
      mediaQuery.addEventListener("change", handler);
      localStorage.setItem("grs-theme", "system");
      
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      applyTheme(theme);
      localStorage.setItem("grs-theme", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState(isDark ? "light" : "dark");
    } else {
      setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
