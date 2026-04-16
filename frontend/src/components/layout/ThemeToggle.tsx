"use client";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none"
      style={{
        background: theme === "dark"
          ? "linear-gradient(135deg, #1e3a8a, #3b82f6)"
          : "linear-gradient(135deg, #fbbf24, #f59e0b)",
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-xs"
        style={{
          left: theme === "dark" ? "2px" : "calc(100% - 22px)",
          background: "white",
        }}
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </div>
    </button>
  );
}
