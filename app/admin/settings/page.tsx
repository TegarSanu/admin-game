"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Lock, Eye, EyeOff, Save, Loader2, Sparkles, Terminal, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("Semua kolom kata sandi wajib diisi");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Kata sandi baru minimal harus 6 karakter");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Konfirmasi kata sandi baru tidak cocok");
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
          name: user?.name,
          email: user?.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Kata sandi berhasil diperbarui!");
        // Reset form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.error || "Gagal memperbarui kata sandi");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
          Pengaturan <span className="text-accent-dynamic">Akun</span>
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Kelola parameter keamanan akun Anda dan sesuaikan preferensi platform lainnya.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Security Settings (Change Password) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-border/50 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl accent-icon-box flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-wider leading-none">
                Ubah Kata Sandi
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Perbarui kredensial kata sandi keamanan Anda secara berkala.
              </p>
            </div>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-4 pt-2">
            {/* Current Password */}
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Kata Sandi Saat Ini
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  required
                  disabled={loading}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2.5 bg-muted/30 border border-border hover:border-accent-dynamic/40 focus:border-accent-dynamic/80 focus:bg-muted/10 rounded-lg outline-none text-sm transition-all duration-300"
                  placeholder="Masukkan kata sandi saat ini"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  required
                  disabled={loading}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2.5 bg-muted/30 border border-border hover:border-accent-dynamic/40 focus:border-accent-dynamic/80 focus:bg-muted/10 rounded-lg outline-none text-sm transition-all duration-300"
                  placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  required
                  disabled={loading}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2.5 bg-muted/30 border border-border hover:border-accent-dynamic/40 focus:border-accent-dynamic/80 focus:bg-muted/10 rounded-lg outline-none text-sm transition-all duration-300"
                  placeholder="Masukkan kembali kata sandi baru"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-accent px-5 py-2.5 text-xs font-black uppercase rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Perbarui Kata Sandi
              </button>
            </div>
          </form>
        </motion.div>

        {/* Right Column: Customization info & System Specs */}
        <div className="space-y-8">
          {/* Customization Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel p-6 rounded-2xl border border-border/50 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Personalisasi Tema
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Anda dapat menyesuaikan warna aksen dashboard admin (seperti Indigo, Rose, Emerald, atau Amber) serta mengganti mode tampilan (Gelap/Terang) secara instan.
            </p>
            <div className="bg-muted/30 border border-border/50 rounded-xl p-3.5 text-[11px] text-muted-foreground">
              Akses cepat menu kustomisasi melalui tombol ikon <strong>Kuas Cat</strong> di sebelah tombol Notifikasi pada Header bagian atas halaman ini.
            </div>
          </motion.div>

          {/* System Specs Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-panel p-6 rounded-2xl border border-border/50 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Info className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Informasi Sistem
              </h3>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs py-1 border-b border-border/30">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Nama Platform</span>
                <span className="font-semibold text-foreground">Dunia Pintar Admin</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-border/30">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Versi</span>
                <span className="font-semibold text-foreground">v2.1.0</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-border/30">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Lingkungan</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-accent-dynamic/15 text-accent-dynamic border border-accent-dynamic/20">
                  <Terminal className="w-3 h-3" /> {process.env.NODE_ENV}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
