"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Building2, User, Mail, Phone, DollarSign, Target } from "lucide-react";

interface CRMModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'lead' | 'company';
  onSubmit: (data: any) => void;
}

export default function CRMModal({ isOpen, onClose, title, type, onSubmit }: CRMModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-card border border-border shadow-2xl rounded-[2.5rem] overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/20">
            <div>
              <h3 className="text-xl font-black text-foreground tracking-tight">{title}</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                Enter {type} details below
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Form Content */}
          <form className="p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit({}); }}>
            {type === 'lead' ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                    <input required className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-foreground/5 focus:border-foreground/20 transition-all text-sm font-bold" placeholder="e.g. John Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Company</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                    <input required className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-foreground/5 focus:border-foreground/20 transition-all text-sm font-bold" placeholder="Company name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                    <input type="email" required className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-foreground/5 focus:border-foreground/20 transition-all text-sm font-bold" placeholder="email@address.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Deal Value</label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                    <input type="number" required className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-foreground/5 focus:border-foreground/20 transition-all text-sm font-bold" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Status</label>
                  <div className="relative group">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                    <select className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-foreground/5 focus:border-foreground/20 transition-all text-sm font-bold appearance-none">
                      <option>Hot</option>
                      <option>Warm</option>
                      <option>Cold</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Company Name</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                    <input required className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-foreground/5 focus:border-foreground/20 transition-all text-sm font-bold" placeholder="e.g. Nexus Softwares" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Industry</label>
                  <input required className="w-full px-4 py-3 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-foreground/5 focus:border-foreground/20 transition-all text-sm font-bold" placeholder="e.g. Technology" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Website</label>
                  <input required className="w-full px-4 py-3 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-4 focus:ring-foreground/5 focus:border-foreground/20 transition-all text-sm font-bold" placeholder="www.example.com" />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-3.5 px-4 bg-muted text-foreground rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-muted/80 transition-all">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-3.5 px-4 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-foreground/10">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
