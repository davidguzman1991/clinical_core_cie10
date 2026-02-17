"use client";

import { motion } from "framer-motion";
import { Brain, Zap } from "lucide-react";

export default function AIStatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="mx-auto mt-5 w-full max-w-2xl"
    >
      <div className="relative overflow-hidden rounded-2xl border border-purple-ai-200/40 bg-gradient-to-r from-turquoise-500/[0.06] via-card to-purple-ai-500/[0.06] p-4 dark:border-purple-ai-800/30">
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-ai-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-turquoise-500/10 blur-2xl" />

        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-turquoise-500/20 to-purple-ai-500/20">
            <Brain className="h-5 w-5 text-purple-ai-500 dark:text-purple-ai-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                Modo IA clínica activado
              </p>
              <Zap className="h-3.5 w-3.5 text-turquoise-500 animate-pulse-glow" />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              Busca diagnósticos, sugiere diferenciales y ayuda al razonamiento.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
