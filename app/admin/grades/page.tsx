"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, CheckCircle, RotateCcw, Award, Star, Coins } from "lucide-react";
import { toast } from "sonner";

interface StudentItem {
  _id: string;
  username: string;
  name: string;
  avatar: string;
  gradeId: string;
  age: number;
  stars: number;
  badges: string[];
  unclaimedRupiah: number;
  claimedRupiah: number;
  parentEmail?: string;
  unlockedStickers?: string[];
  gameProgress?: Record<string, { starsEarned: number; completedCount: number; highScore: number }>;
}

export default function StudentGradesPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      } else {
        toast.error("Gagal mengambil data nilai murid");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi internet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAction = async (studentId: string, action: "claim" | "reset") => {
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, studentId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'claim' ? "Klaim berhasil disetujui!" : "Tabungan berhasil direset!");
        fetchStudents();
      } else {
        toast.error(data.error || "Gagal memproses aksi");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStickerEmoji = (id: string): string => {
    const emojis: Record<string, string> = {
      tiger: "🐯", rabbit: "🐰", panda: "🐼", frog: "🐸",
      unicorn: "🦄", dino: "🦖", rocket: "🚀", donut: "🍩",
      star_champ: "🏆"
    };
    return emojis[id] || "🧸";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
          Nilai & <span className="text-accent-dynamic">Tabungan Murid</span>
        </h1>
        <p className="text-muted-foreground text-sm font-medium mt-1">
          Pantau perkembangan belajar murid, perolehan bintang, lencana, serta kelola pencairan tabungan mereka.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-10 h-10 text-accent-dynamic animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {students.map((student) => {
            const isExpanded = expandedIds[student._id] || false;
            return (
              <motion.div
                key={student._id}
                whileHover={{ y: -2 }}
                className="bg-card border border-border/60 rounded-2xl p-6 flex flex-col justify-between space-y-6"
              >
                {/* Profile info */}
                <div className="flex items-start gap-4">
                  <span className="text-4xl p-2 bg-secondary rounded-xl select-none">
                    {student.avatar}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-foreground">{student.name} ({student.username || "no-username"})</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black bg-accent-dynamic/15 text-accent-dynamic px-2 py-0.5 rounded uppercase">
                        {student.gradeId.replace("_", " ")}
                      </span>
                      <span className="text-xs text-muted-foreground font-bold">
                        Umur: {student.age} Tahun
                      </span>
                      {student.parentEmail && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold border border-blue-500/10">
                          Ortu: {student.parentEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-2 gap-4 border-y border-border/40 py-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">Bintang</span>
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{student.stars} Bintang</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">Lencana</span>
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <Award className="w-4 h-4 text-violet-500" />
                      <span className="truncate max-w-[150px]">{student.badges.length > 0 ? student.badges.join(", ") : "Belum ada"}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Details: Stickers and Game Progress */}
                <div className="space-y-2">
                  <button
                    onClick={() => toggleExpand(student._id)}
                    className="w-full text-center py-2 bg-secondary/60 hover:bg-secondary border border-border/30 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
                  >
                    {isExpanded ? "Sembunyikan Progress & Stiker ▲" : "Lihat Progress & Stiker ▼"}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4 pt-3 border-t border-border/20 text-xs overflow-hidden"
                    >
                      {/* Stickers Section */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px]">Stiker yang Dimiliki</h4>
                        {student.unlockedStickers && student.unlockedStickers.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {student.unlockedStickers.map((stId) => (
                              <span
                                key={stId}
                                title={stId}
                                className="text-xl p-1 bg-secondary rounded-lg border border-border/20"
                              >
                                {getStickerEmoji(stId)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">Belum ada stiker yang dibeli.</p>
                        )}
                      </div>

                      {/* Game Progress Section */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px]">Detail Progress Game</h4>
                        {student.gameProgress && Object.keys(student.gameProgress).length > 0 ? (
                          <div className="overflow-x-auto border border-border/30 rounded-xl bg-secondary/10">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-secondary/40 text-[9px] font-black uppercase text-muted-foreground border-b border-border/30">
                                  <th className="p-2">Game</th>
                                  <th className="p-2 text-center">Bintang</th>
                                  <th className="p-2 text-center">Selesai</th>
                                  <th className="p-2 text-center">High Score</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(student.gameProgress).map(([gameId, details]) => (
                                  <tr key={gameId} className="border-b border-border/20 font-medium">
                                    <td className="p-2 truncate max-w-[120px] font-bold text-foreground uppercase tracking-wide text-[10px]">
                                      {gameId.replace(/([A-Z])/g, " $1")}
                                    </td>
                                    <td className="p-2 text-center">⭐ {details.starsEarned}</td>
                                    <td className="p-2 text-center">{details.completedCount}x</td>
                                    <td className="p-2 text-center font-bold text-accent-dynamic">{details.highScore}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic">Belum ada progres game tercatat.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Reward and Pocket money */}
                <div className="bg-secondary/40 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-muted-foreground">Belum Diklaim:</span>
                    <span className="text-amber-500">Rp {student.unclaimedRupiah.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-muted-foreground">Tabungan (Claimed):</span>
                    <span className="text-emerald-500">Rp {student.claimedRupiah.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(student._id, "claim")}
                    disabled={student.unclaimedRupiah === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Setujui Klaim</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Reset tabungan sebesar Rp ${student.claimedRupiah.toLocaleString("id-ID")}?`)) {
                        handleAction(student._id, "reset");
                      }
                    }}
                    disabled={student.claimedRupiah === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-xs hover:bg-rose-600 transition-all disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Tabungan</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
