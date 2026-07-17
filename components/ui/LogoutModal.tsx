"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { useLogoutModal } from "@/lib/store";

export default function LogoutModal() {
  const { isOpen, close } = useLogoutModal();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-10 p-6 flex flex-col items-center text-center"
          >
            <div 
              className="w-12 h-12 bg-red-500/15 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-500/10"
            >
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-foreground mb-2">
              Konfirmasi Keluar
            </h3>
            
            <p className="text-sm text-muted-foreground mb-6">
              Apakah Anda yakin ingin keluar dari Dunia Pintar Admin Dashboard? Sesi aktif Anda akan diakhiri.
              </p>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={close}
                className="flex-1 py-2.5 px-4 text-xs font-semibold bg-muted hover:bg-muted/80 border border-border text-foreground rounded-xl transition-colors duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 text-xs font-black bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-600/30 transition-all duration-200"
              >
                Keluar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
