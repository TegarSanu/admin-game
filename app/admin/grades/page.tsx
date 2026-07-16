"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, CheckCircle, RotateCcw, Award, Star, Users, Search, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";

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
  const { user } = useAuthStore();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");

  const isSuperAdmin = user?.role?.name === "Super Admin" || user?.role?.name === "Administrator";

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

  const getGradeLabel = (id: string) => {
    return id.toUpperCase().replace("_", " ");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedGrade("all");
  };

  // 1. Get unique grades dynamically from student list
  const uniqueGrades = Array.from(new Set(students.map(s => s.gradeId))).sort();

  // 2. Filter students based on state
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.username && student.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.parentEmail && student.parentEmail.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesGrade = selectedGrade === "all" || student.gradeId === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  // 3. Group filtered students by parent email
  const groupedStudents = filteredStudents.reduce((acc: Record<string, StudentItem[]>, student) => {
    const parentKey = student.parentEmail || "Tanpa Orang Tua";
    if (!acc[parentKey]) {
      acc[parentKey] = [];
    }
    acc[parentKey].push(student);
    return acc;
  }, {});

  const renderStudentCard = (student: StudentItem) => {
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
            <h3 className="text-lg font-black text-foreground">
              {student.name} ({student.username || "no-username"})
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black bg-accent-dynamic/15 text-accent-dynamic px-2 py-0.5 rounded uppercase">
                {getGradeLabel(student.gradeId)}
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
              <span className="truncate max-w-[150px]">
                {student.badges.length > 0 ? student.badges.join(", ") : "Belum ada"}
              </span>
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

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-card border border-border/50 p-4 rounded-2xl shadow-sm">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama murid, username, atau email orang tua..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-secondary/40 border border-border/60 hover:border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-dynamic focus:border-accent-dynamic transition-all text-foreground placeholder:text-muted-foreground/60"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Grade Select Dropdown */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-secondary/40 border border-border/60 hover:border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-dynamic focus:border-accent-dynamic transition-all text-foreground"
          >
            <option value="all">Semua Kelas</option>
            {uniqueGrades.map((gradeId) => (
              <option key={gradeId} value={gradeId}>
                Kelas {getGradeLabel(gradeId)}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        {(searchTerm || selectedGrade !== "all") && (
          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-2 border border-border/60 rounded-xl text-sm font-semibold hover:bg-secondary text-muted-foreground hover:text-foreground transition-all shrink-0"
          >
            <X className="w-4 h-4" />
            <span>Bersihkan Filter</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-10 h-10 text-accent-dynamic animate-spin" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card border border-dashed border-border/60 rounded-2xl space-y-3">
          <Filter className="w-12 h-12 text-muted-foreground/50" />
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-foreground">Tidak ada hasil ditemukan</h3>
            <p className="text-xs text-muted-foreground">Coba ubah kata kunci pencarian Anda atau pilih kelas lain.</p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-secondary text-foreground border border-border/60 rounded-xl text-xs font-bold hover:bg-secondary-hover transition-all"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : isSuperAdmin ? (
        <div className="space-y-12">
          {Object.entries(groupedStudents).map(([parentEmail, parentStudents]) => (
            <div key={parentEmail} className="space-y-6">
              {/* Group Section Header */}
              <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground uppercase tracking-wide">
                    {parentEmail === "Tanpa Orang Tua" ? "Tanpa Orang Tua / Mandiri" : `Orang Tua: ${parentEmail}`}
                  </h2>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {parentStudents.length} Anak Terdaftar
                  </p>
                </div>
              </div>

              {/* Children Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {parentStudents.map((student) => renderStudentCard(student))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStudents.map((student) => renderStudentCard(student))}
        </div>
      )}
    </div>
  );
}
