"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Shield, Calendar, Clock, Activity, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type User = { 
  id: string; 
  name: string; 
  email: string; 
  role: string; 
  status: string;
  roleId?: string;
  createdAt?: string;
  updatedAt?: string;
};

interface UserDetailsProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function UserDetails({ user, isOpen, onClose, onUpdate }: UserDetailsProps) {
  const [detailedUser, setDetailedUser] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [suspending, setSuspending] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      setLoading(true);
      fetch(`/api/admin/users/${user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch details");
          return res.json();
        })
        .then((data) => {
          setDetailedUser(data.user);
          setActivities(data.activities || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch detailed user", err);
          setLoading(false);
        });
    } else {
      setDetailedUser(null);
      setActivities([]);
    }
  }, [isOpen, user?.id]);

  const handleToggleStatus = async () => {
    const activeUser = detailedUser || user;
    if (!activeUser) return;
    setSuspending(true);
    const newStatus = activeUser.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`/api/admin/users/${activeUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: activeUser.name,
          email: activeUser.email,
          role: activeUser.roleId || activeUser.role,
          status: newStatus,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDetailedUser(data.user);
        toast.success(`Account ${newStatus === "Active" ? "activated" : "suspended"} successfully`);
        if (onUpdate) onUpdate();
      } else {
        const errData = await res.json();
        toast.error(`Error: ${errData.error || "Failed to update account status"}`);
      }
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("An unexpected error occurred");
    } finally {
      setSuspending(false);
    }
  };

  if (!user) return null;

  const displayUser = detailedUser || user;
  const isUserActive = displayUser.status === "Active";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-[110] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center font-black">
                  {displayUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground leading-none">{displayUser.name}</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">{displayUser.role}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-3">
                  <div className="w-6 h-6 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest animate-pulse">Loading Details...</p>
                </div>
              ) : (
                <div className="p-8 space-y-8">
                  {/* Status Badges */}
                  <div className="flex gap-4">
                    <div className="flex-1 glass-panel p-4 rounded-2xl border border-border/50">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Account Status</p>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          isUserActive ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                        )} />
                        <span className="text-sm font-bold text-foreground">{displayUser.status}</span>
                      </div>
                    </div>
                    <div className="flex-1 glass-panel p-4 rounded-2xl border border-border/50">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Security Level</p>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-bold text-foreground">
                          {displayUser.role === "Super Admin" || displayUser.role === "Admin" ? "Elevated" : "Standard"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</p>
                          <p className="text-sm font-bold text-foreground truncate">{displayUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Joined Date</p>
                          <p className="text-sm font-bold text-foreground truncate">
                            {displayUser.createdAt 
                              ? new Date(displayUser.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
                              : "N/A"
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Last Updated</p>
                          <p className="text-sm font-bold text-foreground truncate">
                            {displayUser.updatedAt
                              ? new Date(displayUser.updatedAt).toLocaleString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : "N/A"
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Recent Activity</h3>
                    </div>
                    
                    {activities.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-border rounded-2xl bg-muted/10">
                        <Activity className="w-5 h-5 text-muted-foreground/50 mx-auto mb-2 animate-pulse" />
                        <p className="text-xs text-muted-foreground font-medium">No recent activities found for this user.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50">
                        {activities.map((activity) => {
                          let iconColor = 'blue';
                          let Icon = Activity;
                          if (activity.type === 'Create') {
                            iconColor = 'emerald';
                            Icon = CheckCircle2;
                          } else if (activity.type === 'Delete') {
                            iconColor = 'rose';
                            Icon = Shield;
                          } else if (activity.type === 'Login') {
                            iconColor = 'blue';
                            Icon = Lock;
                          }

                          return (
                            <div key={activity.id} className="relative flex gap-4 pl-10">
                              <div className={cn(
                                "absolute left-0 w-8 h-8 rounded-full border-4 border-card flex items-center justify-center z-10",
                                iconColor === 'blue' && "bg-blue-500/10 text-blue-500",
                                iconColor === 'emerald' && "bg-emerald-500/10 text-emerald-500",
                                iconColor === 'rose' && "bg-rose-500/10 text-rose-500",
                                iconColor === 'amber' && "bg-amber-500/10 text-amber-500"
                              )}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-foreground leading-tight">{activity.description}</p>
                                <p className="text-[10px] font-medium text-muted-foreground mt-1">
                                  {new Date(activity.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-border bg-muted/10 grid grid-cols-2 gap-3">
              <button 
                onClick={() => toast.info("Password reset link sent (simulated)")}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                Reset Pass
              </button>
              <button 
                onClick={() => toast.info("Activity log details loaded (simulated)")}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                Auth Logs
              </button>
              <button 
                onClick={handleToggleStatus}
                disabled={loading || suspending}
                className={cn(
                  "col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 cursor-pointer",
                  isUserActive 
                    ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" 
                    : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                )}
              >
                <AlertCircle className="w-4 h-4" />
                {suspending 
                  ? "Processing..." 
                  : isUserActive 
                    ? "Suspend Account" 
                    : "Activate Account"
                }
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
