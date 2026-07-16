"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, RefreshCw, Landmark, AlertCircle, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface RewardConfigItem {
  _id?: string;
  gradeId: string;
  pointsPerCorrect: number;
  maxRupiahLimit: number;
}

export default function RewardConfigPage() {
  const [configs, setConfigs] = useState<RewardConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Create Class Form States
  const [newGradeId, setNewGradeId] = useState("");
  const [newPoints, setNewPoints] = useState(300);
  const [newLimit, setNewLimit] = useState(2000);
  const [adding, setAdding] = useState(false);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/rewards");
      const data = await res.json();
      if (data.success) {
        setConfigs(data.configs);
      } else {
        toast.error("Gagal mengambil data konfigurasi hadiah");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi internet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleChange = (gradeId: string, field: "pointsPerCorrect" | "maxRupiahLimit", value: number) => {
    setConfigs(prev =>
      prev.map(c => (c.gradeId === gradeId ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/rewards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Konfigurasi hadiah berhasil disimpan!");
      } else {
        toast.error(data.error || "Gagal menyimpan perubahan");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi ke server");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeId.trim()) {
      toast.error("Nama/ID Kelas wajib diisi!");
      return;
    }

    try {
      setAdding(true);
      const res = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeId: newGradeId,
          pointsPerCorrect: newPoints,
          maxRupiahLimit: newLimit
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Kelas baru berhasil didaftarkan!");
        setShowAddModal(false);
        setNewGradeId("");
        setNewPoints(300);
        setNewLimit(2000);
        fetchConfigs();
      } else {
        toast.error(data.error || "Gagal mendaftarkan kelas baru");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi internet");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteClass = async (gradeId: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus konfigurasi kelas "${gradeId.replace("_", " ").toUpperCase()}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/rewards?gradeId=${gradeId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Kelas berhasil dihapus dari sistem!");
        fetchConfigs();
      } else {
        toast.error(data.error || "Gagal menghapus kelas");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi internet");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
            Manajemen & <span className="text-accent-dynamic">Aturan Kelas</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Tambah, hapus, dan atur nominal rupiah per jawaban benar serta batas maksimal uang saku harian anak per kelas.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground border border-border/80 rounded-xl font-bold text-sm hover:bg-secondary/85 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent-dynamic text-accent-dynamic-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-accent-dynamic/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Menyimpan..." : "Simpan Aturan"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-10 h-10 text-accent-dynamic animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.map((cfg) => (
            <motion.div
              key={cfg.gradeId}
              whileHover={{ y: -3 }}
              className="bg-card border border-border/60 rounded-2xl p-6 space-y-4 shadow-sm relative group"
            >
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteClass(cfg.gradeId)}
                className="absolute top-4 right-4 p-2 bg-destructive/10 text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                title="Hapus Kelas"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-foreground uppercase tracking-tight pr-6">
                  {cfg.gradeId.replace("_", " ")}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Hadiah / Soal</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-black">Rp</span>
                    <input
                      type="number"
                      value={cfg.pointsPerCorrect}
                      onChange={(e) => handleChange(cfg.gradeId, "pointsPerCorrect", Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Limit Harian</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-black">Rp</span>
                    <input
                      type="number"
                      value={cfg.maxRupiahLimit}
                      onChange={(e) => handleChange(cfg.gradeId, "maxRupiahLimit", Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic font-bold"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Class Modal overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6 relative"
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:bg-muted rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Tambah Kelas Baru</h2>
              <p className="text-muted-foreground text-xs font-medium mt-1">
                Masukkan detail nama kelas dan aturan reward nominal rupiah untuk pendaftaran baru.
              </p>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase">ID / Nama Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: sd 6 atau tk b"
                  value={newGradeId}
                  onChange={(e) => setNewGradeId(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent-dynamic font-bold"
                />
                <span className="text-[10px] text-muted-foreground font-bold">Spasi akan otomatis diubah menjadi underscore (_) oleh sistem.</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Hadiah / Soal</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-black">Rp</span>
                    <input
                      type="number"
                      required
                      value={newPoints}
                      onChange={(e) => setNewPoints(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Limit Harian</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-black">Rp</span>
                    <input
                      type="number"
                      required
                      value={newLimit}
                      onChange={(e) => setNewLimit(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full py-2.5 bg-accent-dynamic text-accent-dynamic-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 mt-2"
              >
                {adding ? "Mendaftarkan..." : "Daftarkan Kelas"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
