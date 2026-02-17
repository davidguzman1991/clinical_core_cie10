"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex flex-col items-center px-4 pt-8 pb-2 text-center sm:pt-12"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-turquoise-500 to-purple-ai-500 shadow-[0_8px_24px_-6px_rgba(0,184,184,0.4)]"
      >
        <Activity className="h-7 w-7 text-white" />
      </motion.div>

      <Badge variant="ai" className="mb-4">
        Clinical AI
      </Badge>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
      >
        Buscador inteligente{" "}
        <span className="gradient-text">de diagnósticos</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mt-2 max-w-sm text-sm text-muted-foreground sm:text-base"
      >
        IA clínica en tiempo real
      </motion.p>
    </motion.header>
  );
}
