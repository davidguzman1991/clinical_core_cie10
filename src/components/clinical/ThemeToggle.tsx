"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="h-10 w-10 rounded-xl" />;
  }

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted"
      whileTap={{ scale: 0.92 }}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 180 : 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === "dark" ? (
          <Moon className="h-[18px] w-[18px] text-purple-ai-400" />
        ) : (
          <Sun className="h-[18px] w-[18px] text-turquoise-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
