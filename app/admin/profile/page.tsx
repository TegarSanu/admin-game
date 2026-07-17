"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, ToggleLeft, Edit2, Save, X, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Sync state with user store when loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Nama dan Email wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Update global auth store state
        setUser(data.user);
        toast.success("Profil Anda berhasil diperbarui!");
        setIsEditing(false);
      } else {
        toast.error(data.error || "Gagal memperbarui profil");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get user initials for display
  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "AD";

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
          Profil <span className="text-accent-dynamic">Saya</span>
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Kelola detail akun personal Anda dan lihat informasi hak akses sistem Anda.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card: Avatar & Summary */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center space-y-4 border border-border/50"
        >
          <div 
            className="w-24 h-24 rounded-full accent-icon-box-solid flex items-center justify-center text-3xl font-black shadow-lg"
            style={{ boxShadow: "0 8px 30px var(--accent-glow)" }}
          >
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground truncate max-w-full">
              {user.name}
            </h2>
            <p className="text-xs text-muted-foreground truncate max-w-full mt-1">
              {user.email}
            </p>
          </div>

          <div className="w-full h-px bg-border/50 my-2" />

          {/* Role Badge */}
          <div className="flex flex-col items-center space-y-1.5 w-full">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
              Hak Akses Sistem
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-accent-dynamic/15 text-accent-dynamic border border-accent-dynamic/30">
              <Shield className="w-3.5 h-3.5" />
              {user.role?.name || "Super Admin"}
            </span>
          </div>
        </motion.div>

        {/* Right Card: Account Details Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:col-span-2 glass-panel p-8 rounded-2xl border border-border/50 flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground uppercase tracking-wide">
                Detail Informasi Akun
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-muted/30 hover:bg-muted/60 text-foreground transition-all duration-300 animate-pulse-once"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profil
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      disabled={loading}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border hover:border-accent-dynamic/40 focus:border-accent-dynamic/80 focus:bg-muted/10 rounded-lg outline-none text-sm transition-all duration-300"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      disabled={loading}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border hover:border-accent-dynamic/40 focus:border-accent-dynamic/80 focus:bg-muted/10 rounded-lg outline-none text-sm transition-all duration-300"
                      placeholder="Masukkan alamat email"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-accent px-4 py-2 text-xs font-black uppercase rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Simpan Perubahan
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setIsEditing(false);
                      if (user) {
                        setFormData({
                          name: user.name || "",
                          email: user.email || "",
                        });
                      }
                    }}
                    className="px-4 py-2 text-xs font-bold border border-border hover:bg-muted/50 rounded-lg flex items-center gap-2 transition-colors duration-300"
                  >
                    <X className="w-3.5 h-3.5" /> Batal
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center py-2.5 border-b border-border/30">
                  <span className="w-32 text-xs font-black text-muted-foreground uppercase tracking-wider">
                    Nama Lengkap
                  </span>
                  <span className="text-sm font-semibold text-foreground mt-1 sm:mt-0">
                    {user.name}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-2.5 border-b border-border/30">
                  <span className="w-32 text-xs font-black text-muted-foreground uppercase tracking-wider">
                    Alamat Email
                  </span>
                  <span className="text-sm font-semibold text-foreground mt-1 sm:mt-0">
                    {user.email}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-2.5 border-b border-border/30">
                  <span className="w-32 text-xs font-black text-muted-foreground uppercase tracking-wider">
                    Peran / Role
                  </span>
                  <span className="text-sm font-semibold text-foreground mt-1 sm:mt-0">
                    {user.role?.name || "Super Admin"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center py-2.5">
                  <span className="w-32 text-xs font-black text-muted-foreground uppercase tracking-wider">
                    Status Akun
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    <ToggleLeft className="w-3.5 h-3.5 rotate-180" /> Aktif
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
