"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Users, 
  Gamepad2, 
  FileQuestion, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  BarChart3,
  Store as StoreIcon,
  BookOpen,
  Sticker as StickerIcon
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

type Stat = { id: string; label: string; value: string; detail: string; icon: any; colorClass: string };

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
};

export default function AdminDashboardPage() {
  const { hasPermission } = useAuthStore();
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/admin/stats');
        const data = await statsRes.json();
        
        if (data.stats) {
          const statsArray = [
            {
              id: "users",
              label: "Total Users",
              value: data.stats.totalUsers?.toString() || "0",
              detail: `${data.stats.activeUsers || 0} Aktif`,
              icon: Users,
              colorClass: "bg-emerald-500/10 text-emerald-500"
            },
            {
              id: "games",
              label: "Game Terdaftar",
              value: data.stats.totalGames?.toString() || "0",
              detail: `${data.stats.activeGames || 0} Game Aktif`,
              icon: Gamepad2,
              colorClass: "bg-violet-500/10 text-violet-500"
            },
            {
              id: "games",
              label: "Total Soal Belajar",
              value: data.stats.totalQuestions?.toString() || "0",
              detail: "Dari seluruh pool game",
              icon: FileQuestion,
              colorClass: "bg-amber-500/10 text-amber-500"
            },
            {
              id: "folktales",
              label: "Cerita Rakyat",
              value: data.stats.totalFolkTales?.toString() || "0",
              detail: "Buku Literasi Anak",
              icon: BookOpen,
              colorClass: "bg-pink-500/10 text-pink-500"
            },
            {
              id: "stickers",
              label: "Katalog Stiker",
              value: data.stats.totalStickers?.toString() || "0",
              detail: "Stiker Toko & Album",
              icon: StickerIcon,
              colorClass: "bg-rose-500/10 text-rose-500"
            },
            {
              id: "users",
              label: "Roles Sistem",
              value: data.stats.totalRoles?.toString() || "0",
              detail: "Izin & Akses Pengguna",
              icon: ShieldAlert,
              colorClass: "bg-sky-500/10 text-sky-500"
            }
          ];
          setStats(statsArray);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const visibleStats = stats.filter(stat => {
    if (stat.id === "users") return hasPermission("users", "read");
    if (stat.id === "games") return hasPermission("games", "read");
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
            Game Admin <span className="text-accent-dynamic">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Kelola data akun pengguna, role/hak akses, dan bank soal setiap jenis game edukasi.
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {visibleStats.length > 0 && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="glass-panel rounded-2xl animate-pulse h-32 relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-700/50 mix-blend-overlay" />
               </div>
            ))
          ) : (
            visibleStats.map((stat, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="glass-panel p-6 rounded-2xl flex flex-col relative overflow-hidden group cursor-pointer transition-all duration-300 border border-border/50 hover:border-accent-dynamic/30"
              >
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.colorClass} group-hover:scale-105 transition-transform duration-300`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                      {stat.detail}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-widest">{stat.label}</h3>
                    <p className="text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Main Navigation Modules */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="glass-panel rounded-3xl p-8 space-y-6 relative overflow-hidden border border-border/50"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-foreground/5 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Modul Utama Admin Game
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Pilih modul di bawah ini untuk memulai konfigurasi.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Game Management */}
          {hasPermission("games", "read") && (
            <Link href="/admin/games">
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                className="group glass-panel p-6 rounded-2xl border border-border/50 hover:border-violet-500/30 hover:bg-violet-500/[0.02] cursor-pointer transition-all duration-300 flex flex-col justify-between h-full min-h-[180px] space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-violet-500 transition-colors">Game Management</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Kelola daftar game aktif, parameter batasan waktu, dan tingkat kesulitan per tingkatan kelas.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-violet-500/15 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">
                    Config & Limit
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>
          )}

          {/* Question Pool */}
          {hasPermission("games", "read") && (
            <Link href="/admin/games">
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                className="group glass-panel p-6 rounded-2xl border border-border/50 hover:border-amber-500/30 hover:bg-amber-500/[0.02] cursor-pointer transition-all duration-300 flex flex-col justify-between h-full min-h-[180px] space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <FileQuestion className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-amber-500 transition-colors">Pool Soal Game</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Edit, tambah, dan hapus soal game edukasi dengan editor JSON interaktif langsung di server.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    JSON Question Pool
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>
          )}

          {/* User & Role Management */}
          {hasPermission("users", "read") && (
            <Link href="/admin/users">
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                className="group glass-panel p-6 rounded-2xl border border-border/50 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] cursor-pointer transition-all duration-300 flex flex-col justify-between h-full min-h-[180px] space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-emerald-500 transition-colors">User & Role Management</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Atur hak akses admin/editor, kelola izin modul spesifik, dan tambahkan akun admin baru.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    User Accounts
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>
          )}

          {/* Nilai Murid */}
          {hasPermission("grades", "read") && (
            <Link href="/admin/grades">
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                className="group glass-panel p-6 rounded-2xl border border-border/50 hover:border-sky-500/30 hover:bg-sky-500/[0.02] cursor-pointer transition-all duration-300 flex flex-col justify-between h-full min-h-[180px] space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-sky-500 transition-colors">Nilai & Tabungan Murid</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Lihat perolehan nilai, jumlah bintang, lencana, serta kelola persetujuan klaim tabungan murid.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full">
                    Student Scores
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>
          )}

          {/* Config Hadiah */}
          {hasPermission("rewards", "read") && (
            <Link href="/admin/rewards">
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                className="group glass-panel p-6 rounded-2xl border border-border/50 hover:border-amber-500/30 hover:bg-amber-500/[0.02] cursor-pointer transition-all duration-300 flex flex-col justify-between h-full min-h-[180px] space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                    <StoreIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-amber-500 transition-colors">Config Hadiah</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Atur nominal reward rupiah per pengerjaan soal benar dan batas limit uang saku anak per kelas.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    Reward Rates
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>
          )}

          {/* Cerita Rakyat */}
          <Link href="/admin/folktales">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="group glass-panel p-6 rounded-2xl border border-border/50 hover:border-pink-500/30 hover:bg-pink-500/[0.02] cursor-pointer transition-all duration-300 flex flex-col justify-between h-full min-h-[180px] space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-all duration-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-pink-500 transition-colors">Cerita Rakyat</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Kelola daftar buku cerita rakyat interaktif, deskripsi, wilayah asal, serta konten ilustrasi per halaman.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-pink-500/15 text-pink-600 dark:text-pink-400 px-2 py-0.5 rounded-full">
                  Folk Tales
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </Link>

          {/* Katalog Stiker */}
          <Link href="/admin/stickers">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="group glass-panel p-6 rounded-2xl border border-border/50 hover:border-rose-500/30 hover:bg-rose-500/[0.02] cursor-pointer transition-all duration-300 flex flex-col justify-between h-full min-h-[180px] space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                  <StickerIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-rose-500 transition-colors">Katalog Stiker</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Konfigurasi toko stiker reward anak, atur emoji stiker, harga bintang, nama stiker, dan warna kartu stiker.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                  Sticker Catalog
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </Link>


        </div>
      </motion.div>
    </div>
  );
}
