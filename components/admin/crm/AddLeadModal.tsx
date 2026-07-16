"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, User, DollarSign, Target, Briefcase, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultStatus?: string;
}

export default function AddLeadModal({
  isOpen,
  onClose,
  onSuccess,
  defaultStatus = "New",
}: AddLeadModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [status, setStatus] = useState(defaultStatus);
  const [value, setValue] = useState<number>(0);
  const [priority, setPriority] = useState("Medium");
  const [notes, setNotes] = useState("");

  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default status when prop changes (e.g., in pipeline columns)
  useEffect(() => {
    if (isOpen) {
      setStatus(defaultStatus);
      setName("");
      setEmail("");
      setPhone("");
      setCompanyId("");
      setValue(0);
      setPriority("Medium");
      setNotes("");

      // Fetch companies
      setLoadingCompanies(true);
      fetch("/api/admin/crm/companies")
        .then((res) => res.json())
        .then((data) => {
          setCompanies(data.companies || []);
          if (data.companies && data.companies.length > 0) {
            setCompanyId(data.companies[0]._id);
          }
          setLoadingCompanies(false);
        })
        .catch((err) => {
          console.error("Failed to load companies", err);
          setLoadingCompanies(false);
          toast.error("Failed to load company list");
        });
    }
  }, [isOpen, defaultStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Lead Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!companyId) {
      toast.error("An associated company is required. Please create a company first!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          company: companyId,
          status,
          value,
          priority,
          notes,
        }),
      });

      if (res.ok) {
        toast.success("Opportunity successfully created");
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create opportunity");
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
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-foreground tracking-tight">Create New Deal</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                    Add new sales opportunity to pipeline
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
                {/* Lead Name */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                    Deal / Opportunity Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                      placeholder="e.g. Enterprise Cloud License"
                    />
                  </div>
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                      Contact Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                        placeholder="e.g. contact@acme.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                        placeholder="e.g. +1 (555) 0122"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Select */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                    Account / Company
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    {loadingCompanies ? (
                      <div className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Loading companies...
                      </div>
                    ) : companies.length === 0 ? (
                      <div className="w-full bg-rose-500/5 border border-rose-500/10 text-rose-500 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold uppercase tracking-wider">
                        No companies found. Create one first in Organization Directory!
                      </div>
                    ) : (
                      <select
                        required
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-4 py-3 text-xs font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                      >
                        {companies.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} ({c.industry})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Deal Value and Priority Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                      Deal Value ($ USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        min="0"
                        value={value}
                        onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                        className="w-full bg-muted/30 border border-border rounded-2xl pl-10 pr-4 py-3 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                      Deal Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-muted/30 border border-border rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                {/* Stage */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                    Pipeline Stage
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-muted/30 border border-border rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                  >
                    <option value="New">Incoming (New)</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Won (Closed Won)</option>
                    <option value="Closed Lost">Lost (Closed Lost)</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                    Internal Notes / Description
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-muted/30 border border-border rounded-2xl p-4 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                    placeholder="Enter details about this opportunity..."
                  />
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
                  disabled={isSubmitting || companies.length === 0}
                  className="flex-1 py-4 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-foreground/90 transition-all shadow-lg shadow-foreground/10 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Opportunity"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
