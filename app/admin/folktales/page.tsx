"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, Trash2, Edit2, Check, X, RefreshCw, BookOpen, PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface FolkTalePageItem {
  text: string;
  illustrationKey: string;
  bgColor: string;
}

interface FolkTale {
  id: string;
  title: string;
  icon: string;
  region: string;
  coverColor: string;
  accentColor: string;
  pages: FolkTalePageItem[];
}

export default function FolkTalesPage() {
  const [folktales, setFolktales] = useState<FolkTale[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Selected folk tale for modal editor
  const [selectedTale, setSelectedTale] = useState<FolkTale | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form values
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("📖");
  const [region, setRegion] = useState("");
  const [coverColor, setCoverColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#000000");
  const [pages, setPages] = useState<FolkTalePageItem[]>([]);

  const fetchFolktales = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/folktales");
      const data = await res.json();
      if (data.success) {
        setFolktales(data.folktales);
      } else {
        toast.error("Gagal mengambil data cerita rakyat");
      }
    } catch (err) {
      toast.error("Kesalahan koneksi internet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolktales();
  }, []);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/admin/seed/folktales");
      const data = await res.json();
      if (data.success) {
        toast.success(`Berhasil memuat ulang ${data.count} cerita rakyat dari game!`);
        fetchFolktales();
      } else {
        toast.error("Gagal memuat ulang");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSeeding(false);
    }
  };

  const openEdit = (tale: FolkTale) => {
    setSelectedTale(tale);
    setIsCreating(false);
    setId(tale.id);
    setTitle(tale.title);
    setIcon(tale.icon);
    setRegion(tale.region);
    setCoverColor(tale.coverColor);
    setAccentColor(tale.accentColor);
    setPages([...tale.pages]);
  };

  const openCreate = () => {
    setSelectedTale(null);
    setIsCreating(true);
    setId("");
    setTitle("");
    setIcon("📖");
    setRegion("");
    setCoverColor("#e8f5e9");
    setAccentColor("#2e7d32");
    setPages([{ text: "Paragraf pertama cerita...", illustrationKey: "ilustrasi_1", bgColor: "#ffffff" }]);
  };

  const handleSave = async () => {
    if (!id || !title) {
      toast.error("ID dan Judul wajib diisi");
      return;
    }
    const payload = { id, title, icon, region, coverColor, accentColor, pages };
    try {
      setSaving(true);
      let res;
      if (isCreating) {
        res = await fetch("/api/admin/folktales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/folktales/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (data.success) {
        toast.success(isCreating ? "Cerita baru ditambahkan!" : "Cerita berhasil diperbarui!");
        setSelectedTale(null);
        setIsCreating(false);
        fetchFolktales();
      } else {
        toast.error(data.error || "Gagal menyimpan cerita");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taleId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus cerita rakyat ini?")) return;
    try {
      const res = await fetch(`/api/admin/folktales/${taleId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Cerita rakyat berhasil dihapus!");
        if (selectedTale?.id === taleId) {
          setSelectedTale(null);
        }
        fetchFolktales();
      } else {
        toast.error(data.error || "Gagal menghapus cerita");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    }
  };

  const handleAddPage = () => {
    setPages([...pages, { text: "", illustrationKey: "", bgColor: "#ffffff" }]);
  };

  const handlePageChange = (index: number, field: keyof FolkTalePageItem, value: string) => {
    const updated = [...pages];
    updated[index] = { ...updated[index], [field]: value };
    setPages(updated);
  };

  const handleRemovePage = (index: number) => {
    if (pages.length <= 1) {
      toast.error("Cerita minimal harus memiliki 1 halaman");
      return;
    }
    setPages(pages.filter((_, i) => i !== index));
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
            Kelola <span className="text-accent-dynamic">Cerita Rakyat</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Atur dan perbarui daftar buku cerita rakyat interaktif serta lembaran halaman bacaan murid.
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
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-dynamic text-accent-dynamic-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Cerita Baru</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Folk Tales List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Daftar Buku Cerita</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <RefreshCw className="w-8 h-8 text-accent-dynamic animate-spin" />
            </div>
          ) : folktales.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-6 text-center text-sm text-muted-foreground">
              Belum ada data cerita. Silakan seed dari game.
            </div>
          ) : (
            <div className="space-y-3">
              {folktales.map((tale) => {
                const isSelected = selectedTale?.id === tale.id && !isCreating;
                return (
                  <div
                    key={tale.id}
                    onClick={() => openEdit(tale)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "border-accent-dynamic bg-accent-dynamic/[0.03]"
                        : "border-border/60 bg-card hover:border-accent-dynamic/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-1.5 rounded-lg" style={{ backgroundColor: tale.coverColor }}>
                        {tale.icon}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{tale.title}</h3>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">{tale.region || "Indonesia"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-bold">
                        {tale.pages.length} Hlm
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(tale.id);
                        }}
                        className="text-rose-500 hover:text-rose-600 p-1 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Editor Panel */}
        <div className="lg:col-span-2 space-y-6">
          {(selectedTale || isCreating) ? (
            <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-border/40">
                <h3 className="font-black text-lg text-foreground uppercase tracking-tight">
                  {isCreating ? "Tambah Cerita Baru" : `Edit Cerita: ${title}`}
                </h3>
                <button
                  onClick={() => {
                    setSelectedTale(null);
                    setIsCreating(false);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-muted-foreground block mb-1">ID Cerita</label>
                  <input
                    type="text"
                    disabled={!isCreating}
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-muted-foreground block mb-1">Judul Cerita</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-muted-foreground block mb-1">Wilayah Asal</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-muted-foreground block mb-1">Emoji Cover</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic text-center"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-muted-foreground block mb-1">Cover Color (Hex)</label>
                  <input
                    type="text"
                    value={coverColor}
                    onChange={(e) => setCoverColor(e.target.value)}
                    className="w-full bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-muted-foreground block mb-1">Accent Color (Hex)</label>
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full bg-secondary border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-dynamic"
                  />
                </div>
              </div>

              {/* Pages editor */}
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-foreground">Lembaran Halaman Cerita ({pages.length})</h4>
                  <button
                    onClick={handleAddPage}
                    className="flex items-center gap-1 text-xs font-bold text-accent-dynamic hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambah Halaman</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {pages.map((p, idx) => (
                    <div key={idx} className="p-4 bg-secondary/30 border border-border/40 rounded-xl space-y-3 relative group">
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRemovePage(idx)}
                          className="p-1 hover:bg-rose-500/10 text-rose-500 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[10px] font-black uppercase text-muted-foreground">Halaman {idx + 1}</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Ilustrasi (Asset ID)</label>
                          <input
                            type="text"
                            placeholder="e.g. timun_mas_1"
                            value={p.illustrationKey}
                            onChange={(e) => handlePageChange(idx, "illustrationKey", e.target.value)}
                            className="w-full bg-secondary border border-border/40 rounded-lg px-2.5 py-1 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Background Page (Hex)</label>
                          <input
                            type="text"
                            placeholder="#e8f5e9"
                            value={p.bgColor}
                            onChange={(e) => handlePageChange(idx, "bgColor", e.target.value)}
                            className="w-full bg-secondary border border-border/40 rounded-lg px-2.5 py-1 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase text-muted-foreground block mb-1">Teks Dialog / Cerita</label>
                        <textarea
                          rows={2}
                          value={p.text}
                          onChange={(e) => handlePageChange(idx, "text", e.target.value)}
                          className="w-full bg-secondary border border-border/40 rounded-lg px-2.5 py-1 text-xs focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <button
                  onClick={() => {
                    setSelectedTale(null);
                    setIsCreating(false);
                  }}
                  className="px-5 py-2.5 text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground rounded-xl border border-border/50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold bg-accent-dynamic text-accent-dynamic-foreground hover:opacity-90 rounded-xl"
                >
                  {saving ? "Menyimpan..." : "Simpan Cerita"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground h-full flex flex-col justify-center items-center min-h-[300px]">
              <BookOpen className="w-10 h-10 text-muted-foreground/60 mb-3" />
              <h3 className="font-bold text-foreground">Editor Cerita Rakyat</h3>
              <p className="text-xs text-muted-foreground max-w-xs mt-1">
                Pilih salah satu buku cerita rakyat dari daftar kiri untuk melihat detail lembar halaman, atau klik "Tambah Cerita Baru".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
