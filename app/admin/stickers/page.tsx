"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, Trash2, Edit2, Check, X, RefreshCw, Sticker as StickerIcon } from "lucide-react";
import { toast } from "sonner";

interface Sticker {
  stickerId: string;
  emoji: string;
  name: string;
  cost: number;
  color: string;
}

export default function StickersPage() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State for creating new sticker
  const [isAdding, setIsAdding] = useState(false);
  const [newSticker, setNewSticker] = useState<Omit<Sticker, "">>({
    stickerId: "",
    emoji: "🧸",
    name: "",
    cost: 5,
    color: "#e3f2fd",
  });

  // State for inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSticker, setEditSticker] = useState<Sticker | null>(null);

  const fetchStickers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stickers");
      const data = await res.json();
      if (data.success) {
        setStickers(data.stickers);
      } else {
        toast.error(data.error || "Gagal mengambil data stiker");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi internet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStickers();
  }, []);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/admin/seed/stickers");
      const data = await res.json();
      if (data.success) {
        toast.success(`Berhasil memuat ulang ${data.count} stiker default dari game!`);
        fetchStickers();
      } else {
        toast.error(data.error || "Gagal memuat default");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSeeding(false);
    }
  };

  const handleAddSticker = async () => {
    if (!newSticker.stickerId || !newSticker.name || !newSticker.emoji) {
      toast.error("Semua field wajib diisi");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/admin/stickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSticker),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Stiker baru berhasil ditambahkan!");
        setIsAdding(false);
        setNewSticker({ stickerId: "", emoji: "🧸", name: "", cost: 5, color: "#e3f2fd" });
        fetchStickers();
      } else {
        toast.error(data.error || "Gagal menyimpan stiker");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (sticker: Sticker) => {
    setEditingId(sticker.stickerId);
    setEditSticker({ ...sticker });
  };

  const handleUpdateSticker = async () => {
    if (!editSticker) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/stickers/${editSticker.stickerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSticker),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Stiker berhasil diperbarui!");
        setEditingId(null);
        setEditSticker(null);
        fetchStickers();
      } else {
        toast.error(data.error || "Gagal memperbarui stiker");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSticker = async (stickerId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus stiker ini?")) return;
    try {
      const res = await fetch(`/api/admin/stickers/${stickerId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Stiker berhasil dihapus!");
        fetchStickers();
      } else {
        toast.error(data.error || "Gagal menghapus stiker");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
            Katalog <span className="text-accent-dynamic">Toko Stiker</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Kelola stiker yang dapat dibeli oleh murid menggunakan bintang hasil belajar mereka di aplikasi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl font-bold text-sm border border-border/50 hover:bg-secondary/80 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? "animate-spin" : ""}`} />
            <span>Seed dari Game</span>
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-dynamic text-accent-dynamic-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Stiker</span>
          </button>
        </div>
      </div>

      {/* Add New Sticker Panel */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/80 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end"
        >
          <div>
            <label className="text-xs font-black uppercase text-muted-foreground block mb-2">ID Stiker (Unique)</label>
            <input
              type="text"
              placeholder="e.g. tiger"
              value={newSticker.stickerId}
              onChange={(e) => setNewSticker({ ...newSticker, stickerId: e.target.value })}
              className="w-full bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-muted-foreground block mb-2">Emoji</label>
            <input
              type="text"
              placeholder="e.g. 🦁"
              value={newSticker.emoji}
              onChange={(e) => setNewSticker({ ...newSticker, emoji: e.target.value })}
              className="w-full bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:border-accent-dynamic"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-muted-foreground block mb-2">Nama Stiker</label>
            <input
              type="text"
              placeholder="e.g. Singa Berani"
              value={newSticker.name}
              onChange={(e) => setNewSticker({ ...newSticker, name: e.target.value })}
              className="w-full bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-muted-foreground block mb-2">Harga Bintang</label>
            <input
              type="number"
              value={newSticker.cost}
              onChange={(e) => setNewSticker({ ...newSticker, cost: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic"
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase text-muted-foreground block mb-2">Warna Background (Hex)</label>
            <input
              type="text"
              placeholder="#e3f2fd"
              value={newSticker.color}
              onChange={(e) => setNewSticker({ ...newSticker, color: e.target.value })}
              className="w-full bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic"
            />
          </div>
          <div className="md:col-span-5 flex justify-end gap-3 mt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border/50"
            >
              Batal
            </button>
            <button
              onClick={handleAddSticker}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold bg-accent-dynamic text-accent-dynamic-foreground hover:opacity-90 rounded-lg"
            >
              {saving ? "Menyimpan..." : "Simpan Stiker"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Stickers Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-10 h-10 text-accent-dynamic animate-spin" />
        </div>
      ) : stickers.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 bg-accent-dynamic/10 text-accent-dynamic rounded-full flex items-center justify-center mx-auto">
            <StickerIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-foreground">Katalog Stiker Kosong</h3>
          <p className="text-muted-foreground text-sm">
            Silakan jalankan tombol "Seed dari Game" untuk mengimpor stiker default dari game app.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {stickers.map((s) => {
            const isEditing = editingId === s.stickerId;
            return (
              <motion.div
                key={s.stickerId}
                whileHover={{ y: -4 }}
                className="bg-card border border-border/60 hover:border-accent-dynamic/40 rounded-2xl p-5 flex flex-col justify-between items-center text-center relative group min-h-[220px]"
                style={{ backgroundColor: isEditing ? undefined : `${s.color}15` }}
              >
                {/* Actions overlay */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isEditing && (
                    <>
                      <button
                        onClick={() => startEdit(s)}
                        className="p-1 bg-secondary text-foreground hover:text-accent-dynamic rounded-lg border border-border"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSticker(s.stickerId)}
                        className="p-1 bg-secondary text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg border border-border"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 w-full text-left">
                    <div>
                      <label className="text-[9px] font-black uppercase text-muted-foreground">Emoji</label>
                      <input
                        type="text"
                        value={editSticker?.emoji}
                        onChange={(e) => setEditSticker({ ...editSticker!, emoji: e.target.value })}
                        className="w-full bg-secondary border border-border/40 rounded-lg px-2 py-1 text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-muted-foreground">Nama</label>
                      <input
                        type="text"
                        value={editSticker?.name}
                        onChange={(e) => setEditSticker({ ...editSticker!, name: e.target.value })}
                        className="w-full bg-secondary border border-border/40 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-muted-foreground">Bintang</label>
                      <input
                        type="number"
                        value={editSticker?.cost}
                        onChange={(e) => setEditSticker({ ...editSticker!, cost: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-secondary border border-border/40 rounded-lg px-2 py-1 text-xs"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 bg-secondary hover:bg-secondary/80 rounded"
                      >
                        <X className="w-4 h-4 text-rose-500" />
                      </button>
                      <button
                        onClick={handleUpdateSticker}
                        disabled={saving}
                        className="p-1 bg-accent-dynamic text-accent-dynamic-foreground rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 border border-border/30"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.emoji}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-foreground">{s.name}</h4>
                      <p className="text-xs text-muted-foreground font-semibold">Cost: ⭐ {s.cost}</p>
                    </div>
                    <span className="text-[9px] font-black text-muted-foreground uppercase mt-4 tracking-widest bg-secondary/80 px-2 py-0.5 rounded-full border border-border/30">
                      ID: {s.stickerId}
                    </span>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
