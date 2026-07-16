"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Palette, Sun, Moon, Monitor, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ACCENTS = [
  { id: "indigo", name: "Indigo", color: "#6366f1" },
  { id: "rose", name: "Rose", color: "#f43f5e" },
  { id: "emerald", name: "Emerald", color: "#10b981" },
  { id: "amber", name: "Amber", color: "#f59e0b" },
];

export default function ThemeCustomizer() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeAccent, setActiveAccent] = useState("indigo");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Load saved accent
    const saved = localStorage.getItem("admin-accent") || "indigo";
    setActiveAccent(saved);
    applyAccentClass(saved);

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyAccentClass = (accent: string) => {
    // Remove ALL existing theme accent classes
    const html = document.documentElement;
    html.classList.remove("theme-indigo", "theme-rose", "theme-emerald", "theme-amber");
    // Add new theme class
    html.classList.add(`theme-${accent}`);
  };

  const handleAccentChange = (accentId: string) => {
    setActiveAccent(accentId);
    localStorage.setItem("admin-accent", accentId);
    applyAccentClass(accentId);
  };

  if (!mounted) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors duration-300 relative overflow-hidden flex items-center justify-center"
        aria-label="Customize Theme"
      >
        <Palette className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-72 glass-panel rounded-2xl shadow-2xl p-5 z-50 flex flex-col gap-5 border-border/50"
          >
            {/* Theme Mode Section */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Theme Mode</h4>
              <div className="flex bg-muted/50 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                    theme === 'light' 
                      ? 'bg-background shadow text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                    theme === 'dark' 
                      ? 'bg-background shadow text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                    theme === 'system' 
                      ? 'bg-background shadow text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Auto
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-border/50" />

            {/* Accent Color Section */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Accent Color</h4>
              <div className="grid grid-cols-4 gap-3">
                {ACCENTS.map((accent) => (
                  <button
                    key={accent.id}
                    onClick={() => handleAccentChange(accent.id)}
                    className="flex flex-col items-center gap-1.5 group"
                    title={accent.name}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
                        activeAccent === accent.id 
                          ? 'ring-2 ring-offset-2 ring-offset-background scale-110' 
                          : ''
                      }`}
                      style={{ 
                        backgroundColor: accent.color,
                        ...(activeAccent === accent.id ? { '--tw-ring-color': accent.color } as any : {})
                      }}
                    >
                      {activeAccent === accent.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      activeAccent === accent.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {accent.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Theme Preview */}
            <div className="w-full h-px bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full accent-icon-box-solid shadow-sm" />
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground">
                  {ACCENTS.find(a => a.id === activeAccent)?.name} · {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                </p>
                <p className="text-[10px] text-muted-foreground">Active theme configuration</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
