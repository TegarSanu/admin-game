"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Building2, LayoutDashboard, Settings, Command, Sun, Moon } from "lucide-react";
import { useCommandPalette } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function CommandPalette() {
  const { isOpen, close, toggle } = useCommandPalette();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const defaultActions = [
    { type: "Quick Action", title: "Go to Dashboard", url: "/admin/analytics", icon: LayoutDashboard },
    { type: "Quick Action", title: "Manage CRM Deals", url: "/admin/crm/pipeline", icon: Building2 },
    { type: "Quick Action", title: "Toggle Theme Mode", url: "#theme", icon: theme === 'dark' ? Sun : Moon },
    { type: "Quick Action", title: "System Settings", url: "/admin/settings", icon: Settings },
  ];

  // Initialize defaults on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
      setResults(defaultActions);
    }
  }, [isOpen, theme]);

  // Global listener for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggle, close]);

  // Handle up/down/enter keys inside modal
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) executeAction(selected);
    }
  };

  const executeAction = (item: any) => {
    if (item.url === "#theme") {
      setTheme(theme === "dark" ? "light" : "dark");
      toast.success("Theme mode toggled!");
    } else {
      router.push(item.url);
    }
    close();
  };

  // Debounced API Search
  useEffect(() => {
    if (!query.trim()) {
      setResults(defaultActions);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          const formatted = [
            ...(data.leads || []).map((l: any) => ({
              type: "Lead",
              title: `${l.name} - $${l.value?.toLocaleString()}`,
              url: `/admin/crm/customers`, // Simplification for routing
              icon: User
            })),
            ...(data.companies || []).map((c: any) => ({
              type: "Company",
              title: c.name,
              url: `/admin/crm/companies`,
              icon: Building2
            }))
          ];
          setResults(formatted.length > 0 ? formatted : []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("Global search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-10 flex flex-col"
        >
          {/* Input Header */}
          <div className="flex items-center px-4 py-4 border-b border-border bg-muted/20">
            <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleModalKeyDown}
              placeholder="Search leads, companies, or type a command..."
              className="flex-1 bg-transparent outline-none text-foreground text-lg placeholder:text-muted-foreground/70"
            />
            <div className="flex items-center gap-1 shrink-0 bg-muted px-2 py-1 rounded text-[10px] font-black text-muted-foreground tracking-widest uppercase border border-border">
              <Command className="w-3 h-3" /> K
            </div>
          </div>

          {/* Result List */}
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
            {loading ? (
              <div className="p-8 text-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
                Searching Database...
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => executeAction(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                        selectedIndex === idx
                          ? "bg-foreground/5 text-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedIndex === idx ? "bg-foreground/10 text-foreground" : "bg-muted"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-sm block">{item.title}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          {item.type}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
                No results found for "{query}"
              </div>
            )}
          </div>

          {/* Footer Guides */}
          <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="bg-background border border-border px-1.5 py-0.5 rounded shadow-sm text-[10px]">↑↓</span> Navigate
              </span>
              <span className="flex items-center gap-1">
                <span className="bg-background border border-border px-1.5 py-0.5 rounded shadow-sm text-[10px]">↵</span> Select
              </span>
              <span className="flex items-center gap-1">
                <span className="bg-background border border-border px-1.5 py-0.5 rounded shadow-sm text-[10px]">ESC</span> Close
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
