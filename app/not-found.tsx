"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Rocket } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090E17] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Deep Space / Futuristic Ambient Glows */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-150 h-150 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" 
      />
      
      {/* Subtle Grid Background for that clean futuristic tech vibe */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl px-8 py-16 md:px-16 rounded-[2.5rem] text-center border border-white/10 shadow-2xl backdrop-blur-2xl bg-[#0f172a]/40"
      >
        {/* Animated Futuristic Companion */}
        <div className="flex justify-center mb-10 relative">
           {/* Orbiting ring */}
           <motion.div
             animate={{ rotate: 360 }}
             transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full border-t-cyan-400/50"
           />
           <motion.div
             animate={{ rotate: -360 }}
             transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-full border-b-indigo-400/40 opacity-70"
           />

          <motion.div
            animate={{ 
              y: [-10, 10, -10],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4, 
              ease: "easeInOut" 
            }}
            className="relative z-10 drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]"
          >
            {/* Cute Futuristic Robot SVG */}
            <svg width="160" height="160" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Main Body */}
              <rect x="30" y="40" width="100" height="90" rx="45" fill="url(#bot-grad)" />
              {/* Soft Inner Highlight */}
              <rect x="32" y="42" width="96" height="86" rx="43" fill="transparent" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
              
              {/* Floating Head / Antenna */}
              <path d="M80 40 L80 20" stroke="url(#antenna-grad)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="80" cy="15" r="5" fill="#38BDF8" className="animate-pulse" style={{ filter: "drop-shadow(0 0 4px #38BDF8)" }} />

              {/* Visor Screen */}
              <rect x="40" y="60" width="80" height="40" rx="20" fill="#020617" />
              <rect x="42" y="62" width="76" height="36" rx="18" fill="url(#visor-grad)" />

              {/* Glowing Eyes */}
              <motion.ellipse 
                cx="65" cy="80" rx="6" ry="8" fill="#38BDF8" 
                animate={{ scaleY: [1, 0.1, 1] }} 
                transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.1, 0.2], repeatDelay: 3 }}
                style={{ filter: "drop-shadow(0 0 6px #38BDF8)" }}
              />
              <motion.ellipse 
                cx="95" cy="80" rx="6" ry="8" fill="#38BDF8" 
                animate={{ scaleY: [1, 0.1, 1] }} 
                transition={{ repeat: Infinity, duration: 3.5, times: [0, 0.1, 0.2], repeatDelay: 3 }}
                style={{ filter: "drop-shadow(0 0 6px #38BDF8)" }}
              />

              {/* Little blushes on the screen */}
              <ellipse cx="52" cy="88" rx="6" ry="4" fill="#818CF8" opacity="0.6" style={{ filter: "blur(2px)" }} />
              <ellipse cx="108" cy="88" rx="6" ry="4" fill="#818CF8" opacity="0.6" style={{ filter: "blur(2px)" }} />

              {/* Subtle Screen Reflection */}
              <path d="M48 68 Q 80 64 112 68" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.15" fill="none" />

              {/* Cute Little Robot Arms */}
              <path d="M20 95 Q 10 110 25 105" stroke="url(#bot-grad)" strokeWidth="8" strokeLinecap="round" fill="none" />
              <path d="M140 95 Q 150 110 135 105" stroke="url(#bot-grad)" strokeWidth="8" strokeLinecap="round" fill="none" />

              <defs>
                <linearGradient id="bot-grad" x1="80" y1="40" x2="80" y2="130" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F8FAFC" />
                  <stop offset="1" stopColor="#94A3B8" />
                </linearGradient>
                <linearGradient id="visor-grad" x1="80" y1="62" x2="80" y2="98" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0F172A" />
                  <stop offset="1" stopColor="#1E293B" />
                </linearGradient>
                <linearGradient id="antenna-grad" x1="80" y1="40" x2="80" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#94A3B8" />
                  <stop offset="1" stopColor="#CBD5E1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 font-medium text-xs tracking-[0.2em] uppercase mb-6 border border-cyan-500/20 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            System Error 404
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight font-sans">
            Koneksi <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-indigo-400">Terputus</span>
          </h1>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="text-slate-400 mb-10 max-w-sm mx-auto text-base leading-relaxed"
        >
          Sistem navigasi kami gagal menemukan kordinat halaman yang kamu tuju. Mari kembali ke area operasional yang aman.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link 
              href="/admin" 
              className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white text-slate-900 font-semibold rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] w-full relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-cyan-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Rocket className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Pulang ke Dashboard</span>
            </Link>
          </motion.div>
          
          <motion.button 
            onClick={() => window.history.back()}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-slate-300 font-medium rounded-2xl transition-all w-full sm:w-auto backdrop-blur-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Mundur Satu Langkah
          </motion.button>
        </motion.div>

      </motion.div>
    </div>
  );
}
