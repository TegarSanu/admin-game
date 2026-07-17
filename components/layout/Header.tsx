"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { 
  Search, 
  Bell, 
  User, 
  Menu, 
  LogOut, 
  Settings, 
  Shield, 
  Trash2, 
  Gamepad2, 
  UserPlus, 
  Gift, 
  Info,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileMenu, useAuthStore, useCommandPalette, useLogoutModal } from '@/lib/store';
import ThemeCustomizer from '@/components/admin/ThemeCustomizer';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'game' | 'user' | 'reward' | 'system';
}

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { toggle } = useMobileMenu();
  const { open: openCommandPalette } = useCommandPalette();
  const { user } = useAuthStore();
  const { open: openLogoutModal } = useLogoutModal();

  // Dropdown states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Game Baru Ditambahkan',
      description: 'Game "Petualangan Kancil" berhasil dipublikasikan.',
      time: '5 mnt yang lalu',
      unread: true,
      type: 'game',
    },
    {
      id: '2',
      title: 'Pendaftaran Murid Baru',
      description: 'Murid bernama "Andi Wijaya" telah terdaftar.',
      time: '1 jam yang lalu',
      unread: true,
      type: 'user',
    },
    {
      id: '3',
      title: 'Klaim Hadiah Berhasil',
      description: 'Murid "Siti" menukarkan stiker "Harimau Sumatera".',
      time: '2 jam yang lalu',
      unread: false,
      type: 'reward',
    },
    {
      id: '4',
      title: 'System Update',
      description: 'Pemeliharaan sistem terjadwal pada pukul 23:00 WIB.',
      time: '1 hari yang lalu',
      unread: false,
      type: 'system',
    }
  ]);

  // Refs for click away
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => setMounted(true), []);

  // Click away listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };



  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'game':
        return <Gamepad2 className="w-4 h-4 text-purple-400" />;
      case 'user':
        return <UserPlus className="w-4 h-4 text-blue-400" />;
      case 'reward':
        return <Gift className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-5 glass-panel border-b border-border/50">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={toggle} className="p-2 -ml-2 lg:hidden text-muted-foreground hover:text-foreground transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search Bar (Desktop) */}
        <div 
          onClick={openCommandPalette}
          className="relative w-full max-w-md hidden md:block group cursor-pointer"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-hover:text-foreground transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search... (Ctrl+K)"
            readOnly
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-transparent rounded-lg hover:bg-muted/70 transition-all duration-300 cursor-pointer outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Mobile Search Button */}
        <button 
          onClick={openCommandPalette}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors duration-300 md:hidden"
          aria-label="Cari"
        >
          <Search className="w-5 h-5" />
        </button>
        
        {/* Theme Customizer Panel */}
        <ThemeCustomizer />

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors duration-300 relative"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 flex flex-col"
              >
                {/* Header Dropdown */}
                <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                  <span className="font-bold text-sm">Notifikasi</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs text-accent-dynamic hover:underline font-medium"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>

                {/* List Dropdown */}
                <div className="max-h-64 overflow-y-auto custom-scrollbar divide-y divide-border/50">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleToggleRead(n.id)}
                        className={`p-3 text-left hover:bg-muted/50 transition-colors cursor-pointer flex gap-3 ${n.unread ? 'bg-muted/20' : ''}`}
                      >
                        <div className="p-2 rounded-lg bg-muted shrink-0 h-8 w-8 flex items-center justify-center">
                          {getNotificationIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${n.unread ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                          <p className="text-[9px] text-muted-foreground/60 mt-1">{n.time}</p>
                        </div>
                        {n.unread && (
                          <span className="w-1.5 h-1.5 bg-accent-dynamic rounded-full shrink-0 self-center"></span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      Tidak ada notifikasi baru
                    </div>
                  )}
                </div>

                {/* Footer Dropdown */}
                {notifications.length > 0 && (
                  <button 
                    onClick={handleClearAll}
                    className="w-full py-2 border-t border-border bg-muted/20 hover:bg-muted/40 transition-colors text-center text-xs font-semibold text-red-400 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="w-px h-5 bg-border mx-2 hidden sm:block" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 outline-none group"
          >
            <div 
              className="h-8 w-8 rounded-full accent-icon-box-solid flex items-center justify-center font-medium cursor-pointer transition-transform duration-300 group-hover:scale-105"
            >
              {user?.name ? (
                <span className="text-xs font-bold uppercase">{user.name.substring(0, 2)}</span>
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block group-hover:text-foreground transition-colors duration-200" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 p-1"
              >
                {/* Profile User Info */}
                <div className="px-3 py-3 border-b border-border/50 bg-muted/10 mb-1 rounded-lg">
                  <p className="text-xs font-black text-foreground truncate leading-none">
                    {user?.name || "Admin Demo"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate mt-1">
                    {user?.email || "admin@duniapintar.com"}
                  </p>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-accent-dynamic/15 text-accent-dynamic border border-accent-dynamic/30 mt-2">
                    <Shield className="w-2.5 h-2.5" />
                    {user?.role?.name || "Super Admin"}
                  </span>
                </div>

                {/* Profile Links */}
                <Link 
                  href="/admin/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5" /> Profil Saya
                </Link>
                
                <Link 
                  href="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
                >
                  <Settings className="w-3.5 h-3.5" /> Pengaturan Akun
                </Link>

                <div className="h-px bg-border my-1" />

                {/* Relocated Logout Button */}
                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    openLogoutModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" /> Keluar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </header>
  );
}
