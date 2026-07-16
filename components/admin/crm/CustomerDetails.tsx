"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  Mail,
  Building2,
  Calendar,
  MessageSquare,
  Video,
  FileText,
  MoreVertical,
  ExternalLink,
  RefreshCw,
  Edit3,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CustomerDetails({
  customer,
  onClose,
  onUpdate,
}: {
  customer: any;
  onClose: () => void;
  onUpdate?: () => void;
}) {
  const [isLogging, setIsLogging] = useState(false);
  const [activityType, setActivityType] = useState<"call" | "email" | "meeting" | "note">("call");
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [logContent, setLogContent] = useState("");
  const [isSavingLog, setIsSavingLog] = useState(false);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editValue, setEditValue] = useState<number>(0);
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");

  // Delete State
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchActivities = () => {
    if (!customer?._id) return;
    setLoadingActivities(true);
    fetch(`/api/admin/activity?leadId=${customer._id}`)
      .then(res => res.json())
      .then(data => {
        setActivities(data.activities || []);
        setLoadingActivities(false);
      })
      .catch(err => {
        console.error("Failed to fetch lead activities", err);
        setLoadingActivities(false);
      });
  };

  useEffect(() => {
    if (customer) {
      fetchActivities();
      setIsLogging(false);
      setIsEditing(false);
      setIsDeleting(false);

      // Populate edit fields
      setEditName(customer.name || "");
      setEditEmail(customer.email || "");
      setEditPhone(customer.phone || "");
      setEditValue(customer.value || 0);
      setEditStatus(customer.status || "New");
      setEditPriority(customer.priority || "Medium");
    }
  }, [customer]);

  if (!customer) return null;

  const handleLogActivity = async () => {
    if (!logContent.trim()) return;
    setIsSavingLog(true);
    try {
      const res = await fetch(`/api/admin/crm/leads/${customer._id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activityType,
          description: logContent
        })
      });

      if (res.ok) {
        toast.success("Activity logged successfully");
        setLogContent("");
        setIsLogging(false);
        fetchActivities();
        if (onUpdate) onUpdate();
      } else {
        toast.error("Failed to log activity");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSavingLog(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      toast.error("Lead Name and Email are required");
      return;
    }
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/crm/leads/${customer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          value: editValue,
          status: editStatus,
          priority: editPriority
        })
      });

      if (res.ok) {
        toast.success("Lead details updated");
        setIsEditing(false);
        if (onUpdate) onUpdate();
      } else {
        toast.error("Failed to update lead details");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/crm/leads/${customer._id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success("Lead successfully removed");
        setIsDeleting(false);
        onClose();
        if (onUpdate) onUpdate();
      } else {
        toast.error("Failed to delete lead");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "call": return Phone;
      case "email": return Mail;
      case "meeting": return Video;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot': case 'Qualified': return 'text-rose-500';
      case 'Warm': case 'Contacted': return 'text-amber-500';
      case 'Closed Won': return 'text-emerald-500';
      default: return 'text-sky-500';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-lg bg-card border-l border-border shadow-2xl h-full flex flex-col"
        >
          {/* Inline Delete Confirmation Overlay */}
          {isDeleting && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-[110] flex flex-col items-center justify-center p-6 text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-foreground">Delete Opportunity?</h4>
                <p className="text-xs font-bold text-muted-foreground uppercase mt-1 tracking-wider">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 w-full max-w-xs mt-4">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/15"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center font-black text-lg">
                {customer.name.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight">{customer.name}</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {customer.company?.name || "Independent"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={cn(
                  "p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground",
                  isEditing && "bg-muted text-foreground"
                )}
                title="Edit Details"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsDeleting(true)}
                className="p-2 hover:bg-rose-500/10 rounded-xl transition-colors text-muted-foreground hover:text-rose-500"
                title="Delete Opportunity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            {isEditing ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Edit Lead Details</h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Lead Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                      placeholder="e.g. Acme Deal"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                      placeholder="e.g. contact@acme.com"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                      placeholder="e.g. +1-555-0199"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Deal Value ($)</label>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                        className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Priority</label>
                      <select
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Lead Stage</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-foreground/5 transition-all text-foreground"
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

                  <button
                    onClick={handleSaveEdit}
                    disabled={isSavingEdit}
                    className="w-full py-4 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-foreground/90 transition-all shadow-lg shadow-foreground/10 disabled:opacity-50 mt-6"
                  >
                    {isSavingEdit ? "Saving Changes..." : "Save Details"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Deal Value</p>
                    <p className="text-lg font-black text-foreground">${customer.value?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/50 border border-border flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Lead Status</p>
                    <span className={cn("text-sm font-black uppercase tracking-wider", getStatusColor(customer.status))}>
                      {customer.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>{customer.company?.name || "No Company"} Headquarters</span>
                    </div>
                  </div>
                </div>

                {isLogging ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 bg-muted/30 p-6 rounded-[2rem] border border-border"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Log New Activity</h3>
                      <button onClick={() => setIsLogging(false)} className="p-1 hover:bg-muted rounded-lg">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-2">
                        {(["call", "email", "meeting", "note"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setActivityType(t)}
                            className={cn(
                              "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                              activityType === t ? "bg-foreground text-background border-transparent" : "bg-background text-muted-foreground border-border"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={logContent}
                        onChange={(e) => setLogContent(e.target.value)}
                        className="w-full bg-background border border-border rounded-2xl p-4 text-xs font-medium outline-none focus:ring-4 focus:ring-foreground/5 min-h-[100px] text-foreground"
                        placeholder="Describe the interaction..."
                      />
                      <button
                        onClick={handleLogActivity}
                        disabled={isSavingLog || !logContent.trim()}
                        className="w-full py-3 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-foreground/90 transition-all shadow-lg shadow-foreground/10 disabled:opacity-50"
                      >
                        {isSavingLog ? "Saving..." : "Save Activity"}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Activity Timeline</h3>
                      <button onClick={fetchActivities} className="p-1 hover:bg-muted rounded-lg text-muted-foreground">
                        <RefreshCw className={cn("w-3 h-3", loadingActivities && "animate-spin")} />
                      </button>
                    </div>

                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-border before:content-['']">
                      {loadingActivities ? (
                        <div className="flex justify-center py-10">
                          <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                        </div>
                      ) : activities.length === 0 ? (
                        <div className="text-center py-10 opacity-40">
                          <p className="text-[10px] font-black uppercase tracking-widest">No activities recorded yet</p>
                        </div>
                      ) : (
                        activities.map((activity) => {
                          const Icon = getIcon(activity.type);
                          return (
                            <div key={activity._id} className="relative flex items-start gap-6">
                              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border-2 border-border shadow-sm z-10">
                                <Icon className="h-4 w-4 text-foreground" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-black text-foreground capitalize">{activity.type}</p>
                                  <time className="text-[10px] font-bold text-muted-foreground uppercase">
                                    {moment(activity.createdAt).fromNow()}
                                  </time>
                                </div>
                                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                  {activity.description}
                                </p>
                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-tighter pt-1">
                                  Logged by {activity.user?.name || "System"}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-6 border-t border-border bg-muted/10 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 bg-muted text-foreground rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-muted/80 transition-all">
              <MessageSquare className="w-4 h-4" /> Send Message
            </button>
            <button
              onClick={() => setIsLogging(true)}
              className="flex items-center justify-center gap-2 py-3 bg-foreground text-background rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-foreground/90 transition-all"
            >
              <Phone className="w-4 h-4" /> Log Activity
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
