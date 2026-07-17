/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, Star, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface GameInfo {
  _id: string;
  gameId: string;
  name: string;
  icon: string;
  difficultyRating: number;
  isActive: boolean;
  questionsCount: number;
  difficultyByGrade?: Record<string, any>;
}

export default function GamesPage() {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchGames = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/games");
      const data = await res.json();
      if (data.success) {
        setGames(data.games);
      } else {
        toast.error(data.error || "Gagal mengambil data game");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const filteredGames = games.filter((g) => {
    if (activeTab === "all") return true;
    
    const grades = Object.keys(g.difficultyByGrade || {});
    if (activeTab === "tk") {
      return grades.some(gr => gr.startsWith("tk_"));
    }
    if (activeTab === "sd_bawah") {
      return grades.some(gr => ["sd_1", "sd_2", "sd_3"].includes(gr));
    }
    if (activeTab === "sd_atas") {
      return grades.some(gr => ["sd_4", "sd_5", "sd_6"].includes(gr));
    }
    if (activeTab === "smp") {
      return grades.some(gr => gr.startsWith("smp_"));
    }
    return true;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
            Game <span className="text-accent-dynamic">Management</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Kelola konfigurasi game, parameter tingkat kesulitan, dan pool soal belajar anak.
          </p>
        </div>

        <div className="flex items-center gap-3">
        </div>
      </div>

      {/* Grade Category Tabs */}
      {!loading && games.length > 0 && (
        <div className="flex flex-wrap bg-muted/40 p-1 rounded-2xl max-w-3xl gap-1 border border-border/40">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "all"
                ? "bg-accent-dynamic text-accent-dynamic-foreground shadow-sm font-black"
                : "text-muted-foreground hover:text-foreground font-bold"
            }`}
          >
            Semua Game ({games.length})
          </button>
          <button
            onClick={() => setActiveTab("tk")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "tk"
                ? "bg-accent-dynamic text-accent-dynamic-foreground shadow-sm font-black"
                : "text-muted-foreground hover:text-foreground font-bold"
            }`}
          >
            TK / PAUD ({games.filter(g => Object.keys(g.difficultyByGrade || {}).some(gr => gr.startsWith("tk_"))).length})
          </button>
          <button
            onClick={() => setActiveTab("sd_bawah")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "sd_bawah"
                ? "bg-accent-dynamic text-accent-dynamic-foreground shadow-sm font-black"
                : "text-muted-foreground hover:text-foreground font-bold"
            }`}
          >
            SD Kelas 1-3 ({games.filter(g => Object.keys(g.difficultyByGrade || {}).some(gr => ["sd_1", "sd_2", "sd_3"].includes(gr))).length})
          </button>
          <button
            onClick={() => setActiveTab("sd_atas")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "sd_atas"
                ? "bg-accent-dynamic text-accent-dynamic-foreground shadow-sm font-black"
                : "text-muted-foreground hover:text-foreground font-bold"
            }`}
          >
            SD Kelas 4-6 ({games.filter(g => Object.keys(g.difficultyByGrade || {}).some(gr => ["sd_4", "sd_5", "sd_6"].includes(gr))).length})
          </button>
          <button
            onClick={() => setActiveTab("smp")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "smp"
                ? "bg-accent-dynamic text-accent-dynamic-foreground shadow-sm font-black"
                : "text-muted-foreground hover:text-foreground font-bold"
            }`}
          >
            SMP ({games.filter(g => Object.keys(g.difficultyByGrade || {}).some(gr => gr.startsWith("smp_"))).length})
          </button>
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-10 h-10 text-accent-dynamic animate-spin" />
        </div>
      ) : games.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-accent-dynamic/10 text-accent-dynamic rounded-full flex items-center justify-center mx-auto">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-foreground">Belum Ada Game</h3>
          <p className="text-muted-foreground text-sm">
            Database game kosong. Silakan hubungi administrator untuk menambahkan data game.
          </p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-accent-dynamic/10 text-accent-dynamic rounded-full flex items-center justify-center mx-auto">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-foreground">Game Tidak Ditemukan</h3>
          <p className="text-muted-foreground text-sm">
            Tidak ada game yang dikonfigurasi untuk kategori kelas ini.
          </p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGames.map((g) => (
            <motion.div
              key={g._id}
              variants={item}
              className="group relative bg-card border border-border/60 hover:border-accent-dynamic/40 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Badge status */}
                <span
                  className={`absolute top-6 right-6 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    g.isActive
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {g.isActive ? "Aktif" : "Non-Aktif"}
                </span>

                {/* Game Icon & Title */}
                <div className="flex items-center gap-4">
                  <span className="text-4xl filter drop-shadow-md select-none group-hover:scale-110 transition-transform duration-200">
                    {g.icon}
                  </span>
                  <div>
                    <h2 className="text-lg font-black text-foreground leading-none">
                      {g.name}
                    </h2>
                    <span className="text-xs text-muted-foreground font-bold tracking-tight block mt-1 uppercase">
                      ID: {g.gameId}
                    </span>
                  </div>
                </div>

                {/* Active Grade Badges */}
                <div className="flex flex-wrap gap-1 mt-4">
                  {Object.keys(g.difficultyByGrade || {}).some(gr => gr.startsWith("tk_")) && (
                    <span className="text-[9px] font-black bg-pink-500/10 text-pink-500 dark:text-pink-400 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      TK / PAUD
                    </span>
                  )}
                  {Object.keys(g.difficultyByGrade || {}).some(gr => ["sd_1", "sd_2", "sd_3"].includes(gr)) && (
                    <span className="text-[9px] font-black bg-amber-500/10 text-amber-500 dark:text-amber-400 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      SD 1-3
                    </span>
                  )}
                  {Object.keys(g.difficultyByGrade || {}).some(gr => ["sd_4", "sd_5", "sd_6"].includes(gr)) && (
                    <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      SD 4-6
                    </span>
                  )}
                  {Object.keys(g.difficultyByGrade || {}).some(gr => gr.startsWith("smp_")) && (
                    <span className="text-[9px] font-black bg-sky-500/10 text-sky-500 dark:text-sky-400 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      SMP
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 border-t border-border/40 pt-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">
                      Tingkat Kesulitan
                    </span>
                    <div className="flex items-center gap-1 mt-1 text-amber-500">
                      {Array.from({ length: Math.min(5, g.difficultyRating) }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                      ))}
                      <span className="text-xs font-black text-foreground ml-1">
                        {g.difficultyRating}/5
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">
                      Jumlah Soal
                    </span>
                    <span className="text-sm font-black text-foreground block mt-0.5">
                      {g.questionsCount} Soal
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit button */}
              <div className="mt-8">
                <Link
                  href={`/admin/games/${g.gameId}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted group-hover:bg-accent-dynamic group-hover:text-accent-dynamic-foreground text-foreground rounded-xl font-bold text-sm transition-all duration-300"
                >
                  <span>Edit Soal & Config</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
