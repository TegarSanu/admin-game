"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Globe, MapPin, Users, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCompanyModal({
  isOpen,
  onClose,
  onSuccess,
}: AddCompanyModalProps) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("11-50");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setIndustry("");
      setSize("11-50");
      setWebsite("");
      setAddress("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Company Name is required");
      return;
    }
    if (!industry.trim()) {
      toast.error("Industry is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/crm/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          industry,
          size,
          website,
          address,
        }),
      });

      if (res.ok) {
        toast.success("Company successfully registered");
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create company");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground tracking-tight">Add New Company</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                    Register corporate accounts in directory
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              <div className="space-y-4">
                {/* Company Name */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                      placeholder="e.g. Stark Industries"
                    />
                  </div>
                </div>

                {/* Industry & Size Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                      Industry Sector
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                        placeholder="e.g. Aerospace / Defense"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                      Company Size (Employees)
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-4 py-3 text-xs font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                      >
                        <option value="1-10">1-10 Employees</option>
                        <option value="11-50">11-50 Employees</option>
                        <option value="51-200">51-200 Employees</option>
                        <option value="201-500">201-500 Employees</option>
                        <option value="500+">500+ Employees</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                    Official Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                      placeholder="e.g. https://starkenterprises.com"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                    Office Address / Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                      placeholder="e.g. 10880 Wilshire Blvd, Los Angeles, CA"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-muted hover:bg-muted/80 text-foreground rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-foreground/90 transition-all shadow-lg shadow-foreground/10 disabled:opacity-50"
                >
                  {isSubmitting ? "Registering..." : "Add Company"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
