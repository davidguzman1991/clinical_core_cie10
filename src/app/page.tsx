"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import HeroSection from "@/components/clinical/HeroSection";
import BottomNav from "@/components/clinical/BottomNav";
import ThemeToggle from "@/components/clinical/ThemeToggle";
import ICDNavigator from "@/components/icd/ICDNavigator";
import AISearch from "@/components/search/AISearch";

export default function Home() {
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [activeTab, setActiveTab] = useState("search");

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-turquoise-500/[0.07] blur-3xl dark:bg-turquoise-500/[0.04]" />
        <div className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-purple-ai-500/[0.06] blur-3xl dark:bg-purple-ai-500/[0.03]" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-turquoise-300/[0.05] blur-3xl dark:bg-turquoise-500/[0.02]" />
      </div>

      {/* Theme toggle — fixed top-right */}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="relative mx-auto w-full max-w-3xl px-4 pb-24 sm:pb-12">
        {/* Hero */}
        <HeroSection />

        {/* Mode selector */}
        <div className="mx-auto mt-5 w-full max-w-2xl px-1">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-1.5 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setMode("ai")}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  mode === "ai"
                    ? "bg-turquoise-500 text-white shadow-[0_10px_24px_-14px_rgba(0,184,184,0.7)]"
                    : "text-muted-foreground hover:bg-white/10"
                }`}
              >
                IA Inteligente
              </button>

              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  mode === "manual"
                    ? "bg-turquoise-500 text-white shadow-[0_10px_24px_-14px_rgba(0,184,184,0.7)]"
                    : "text-muted-foreground hover:bg-white/10"
                }`}
              >
                CIE-10 Manual
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {mode === "ai" ? (
            <motion.div
              key="mode-ai"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.22 }}
            >
              <AISearch />
            </motion.div>
          ) : (
            <motion.div
              key="mode-manual"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.22 }}
            >
              <ICDNavigator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom navigation (mobile only) */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
