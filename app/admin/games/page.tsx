"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, Plus, RefreshCw, Star, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface GameInfo {
  _id: string;
  gameId: string;
  name: string;
  icon: string;
  difficultyRating: number;
  isActive: boolean;
  questionsCount: number;
}

export default function GamesPage() {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

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

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/admin/seed/games");
      const data = await res.json();
      if (data.success) {
        toast.success(`Berhasil memuat ulang ${data.count} game dari file JSON!`);
        fetchGames();
      } else {
        toast.error(data.error || "Gagal memuat ulang database");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat memproses data seed");
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

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
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl font-bold text-sm border border-border/50 hover:bg-secondary/80 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? "animate-spin" : ""}`} />
            <span>Seed dari JSON</span>
          </button>
        </div>
      </div>

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
            Database game kosong. Silakan jalankan tombol "Seed dari JSON" untuk mengimpor dari data default.
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="w-full justify-center flex items-center gap-2 px-4 py-2.5 bg-accent-dynamic text-accent-dynamic-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? "animate-spin" : ""}`} />
            <span>Seed Data Game</span>
          </button>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {games.map((g) => (
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

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-8 border-t border-border/40 pt-4">
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
