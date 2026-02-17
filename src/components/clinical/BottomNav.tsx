"use client";

import { motion } from "framer-motion";
import { Search, Star, Clock, Brain, User } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  id: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Buscar", icon: <Search className="h-5 w-5" />, id: "search" },
  { label: "Favoritos", icon: <Star className="h-5 w-5" />, id: "favorites" },
  { label: "Historial", icon: <Clock className="h-5 w-5" />, id: "history" },
  { label: "IA Clínica", icon: <Brain className="h-5 w-5" />, id: "ai" },
  { label: "Perfil", icon: <User className="h-5 w-5" />, id: "profile" },
];

type BottomNavProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <motion.nav
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-xl sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-colors",
                isActive
                  ? "text-turquoise-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 rounded-xl bg-turquoise-500/10 dark:bg-turquoise-500/15"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10 text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
