"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Search, Bell, User, Sun, Moon, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileMenu } from '@/lib/store';
import ThemeCustomizer from '@/components/admin/ThemeCustomizer';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { toggle } = useMobileMenu();

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-5 glass-panel border-b border-border/50">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={toggle} className="p-2 -ml-2 lg:hidden text-muted-foreground hover:text-foreground transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        
        <form className="relative w-full max-w-md hidden md:block group" onSubmit={(e) => e.preventDefault()}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-foreground transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-transparent rounded-lg focus:bg-background focus:border-border focus:ring-4 focus:ring-foreground/5 transition-all duration-300 outline-none text-sm placeholder:text-muted-foreground"
          />
        </form>
      </div>

      <div className="flex items-center gap-4">
        
        {/* Theme Customizer Panel */}
        <ThemeCustomizer />


        {/* Notifications */}
        <button 
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors duration-300 relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 accent-dot rounded-full border border-background"></span>
        </button>
        
        <div className="w-px h-5 bg-border mx-2 hidden sm:block" />

        {/* Profile */}
        <div 
          className="h-8 w-8 rounded-full accent-icon-box-solid flex items-center justify-center font-medium cursor-pointer transition-transform duration-300 hover:scale-105"
        >
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
