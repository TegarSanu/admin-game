"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldCheck, ShieldAlert, Plus, Edit2, Trash2, Check, X, Info, RefreshCw, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const modules = [
  { id: 'users', name: 'User Management', description: 'Access to system users and roles settings' },
  { id: 'games', name: 'Game Management', description: 'Manage game config, limits, and question pools' },
  { id: 'grades', name: 'Nilai Murid', description: 'View student scores, stars, and approve pocket money claims' },
  { id: 'rewards', name: 'Config Hadiah', description: 'Set rupiah rate per correct answer and daily limits' },
  { id: 'game_app', name: 'Aplikasi Game', description: 'Permit entry to the simulated game interface' },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [activeRole, setActiveRole] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Create role states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [cloneFromRoleId, setCloneFromRoleId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Delete role states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizePermissions = (perms: any) => {
    if (!perms) return {};
    const normalized: any = {};
    Object.keys(perms).forEach(key => {
      normalized[key.toLowerCase()] = perms[key];
    });
    return normalized;
  };

  const normalizeRoles = (fetchedRoles: any[]) => {
    return (fetchedRoles || []).map((r: any) => ({
      ...r,
      permissions: normalizePermissions(r.permissions)
    }));
  };

  const fetchRoles = () => {
    setLoading(true);
    fetch('/api/admin/roles')
      .then(res => res.json())
      .then(data => {
        const normalized = normalizeRoles(data.roles || []);
        setRoles(normalized);
        if (normalized.length > 0) {
          // Keep active role selected if it exists, otherwise choose the first one
          setActiveRole((prev: any) => {
            if (prev) {
              const updated = normalized.find((r: any) => r._id === prev._id);
              if (updated) return updated;
            }
            return normalized[0];
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch roles", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const togglePermission = (moduleId: string, action: string) => {
    if (!isEditing || !activeRole) return;
    
    const currentPerms = activeRole.permissions[moduleId] || [];
    const newPerms = currentPerms.includes(action)
      ? currentPerms.filter((p: string) => p !== action)
      : [...currentPerms, action];
        
    setActiveRole({
      ...activeRole,
      permissions: {
        ...activeRole.permissions,
        [moduleId]: newPerms
      }
    });
  };

  const handleSave = async () => {
    if (!activeRole) return;
    if (!activeRole.name.trim()) {
      toast.error("Role name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/roles/${activeRole._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeRole.name,
          permissions: activeRole.permissions,
          description: activeRole.description
        })
      });
      
      if (res.ok) {
        toast.success("Role details and permissions updated");
        setIsEditing(false);
        fetchRoles(); // Refresh
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to save changes");
      }
    } catch (err) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error("Role name is required");
      return;
    }
    
    setIsCreating(true);
    try {
      // Find template permissions
      let basePermissions: any = {};
      if (cloneFromRoleId) {
        const sourceRole = roles.find(r => r._id === cloneFromRoleId);
        if (sourceRole) {
          basePermissions = JSON.parse(JSON.stringify(sourceRole.permissions || {}));
        }
      } else {
        // Start empty
        modules.forEach(m => {
          basePermissions[m.id] = [];
        });
      }

      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDesc,
          permissions: basePermissions,
          isSystem: false
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Role created successfully");
        setIsCreateModalOpen(false);
        setNewRoleName("");
        setNewRoleDesc("");
        setCloneFromRoleId("");
        
        // Fetch and select the new role
        fetch('/api/admin/roles')
          .then(res => res.json())
          .then(newData => {
            const fetchedRoles = newData.roles || [];
            const normalized = normalizeRoles(fetchedRoles);
            setRoles(normalized);
            const newlyCreated = normalized.find((r: any) => r.name === data.role.name);
            if (newlyCreated) {
              setActiveRole(newlyCreated);
            }
          });
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to create role");
      }
    } catch (err) {
      toast.error("An error occurred while creating role");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!activeRole || activeRole.isSystem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/roles/${activeRole._id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success("Role deleted successfully");
        setIsDeleteModalOpen(false);
        
        // Refresh roles and set activeRole to first role (e.g. Administrator)
        fetch('/api/admin/roles')
          .then(res => res.json())
          .then(data => {
            const fetchedRoles = data.roles || [];
            const normalized = normalizeRoles(fetchedRoles);
            setRoles(normalized);
            if (normalized.length > 0) {
              setActiveRole(normalized[0]);
            } else {
              setActiveRole(null);
            }
          });
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to delete role");
      }
    } catch (err) {
      toast.error("An error occurred while deleting role");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && roles.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-foreground/10 border-t-foreground rounded-full animate-spin" />
        <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Synchronizing Security Policies...</p>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col gap-8 max-w-7xl mx-auto overflow-y-auto custom-scrollbar">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1 font-medium">Define access levels and module permissions for your team.</p>
        </div>
        
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-foreground/90 transition-all shadow-lg shadow-foreground/10"
        >
          <Plus className="w-4 h-4" />
          Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-[500px]">
        {/* Role Selection List */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-2">System Roles</h3>
          <div className="space-y-2">
            {roles.map((role) => {
              const Icon = role.isSystem ? ShieldCheck : Shield;
              return (
                <button
                  key={role._id}
                  onClick={() => {
                    setActiveRole(role);
                    setIsEditing(false);
                  }}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all border outline-none group",
                    activeRole?._id === role._id 
                      ? "bg-card border-foreground/20 shadow-xl shadow-foreground/5 ring-1 ring-foreground/10" 
                      : "bg-transparent border-transparent hover:bg-muted/40 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      activeRole?._id === role._id ? "bg-foreground text-background" : "bg-muted group-hover:bg-muted-foreground/10"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-bold truncate",
                        activeRole?._id === role._id ? "text-foreground" : "text-muted-foreground"
                      )}>{role.name}</p>
                      <p className="text-[10px] font-medium opacity-60 truncate uppercase tracking-tighter">
                        {Object.values(role.permissions || {}).flat().length} Permissions Enabled
                      </p>
                    </div>
                    {activeRole?._id === role._id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {activeRole ? (
            <motion.div 
              key={activeRole._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel rounded-[2rem] p-8 flex flex-col h-full"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-border/50 pb-6 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {isEditing ? (
                      <input
                        type="text"
                        disabled={activeRole.isSystem}
                        value={activeRole.name}
                        onChange={(e) => setActiveRole({ ...activeRole, name: e.target.value })}
                        className="text-xl font-black text-foreground bg-background border border-border rounded-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-foreground/20 max-w-xs disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="Role Name"
                        required
                      />
                    ) : (
                      <h2 className="text-xl font-black text-foreground">{activeRole.name}</h2>
                    )}
                    {activeRole.isSystem ? (
                      <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-black uppercase tracking-tighter text-muted-foreground">System Default</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-[10px] font-black uppercase tracking-tighter text-rose-500 border border-rose-500/10">Custom Role</span>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      value={activeRole.description || ""}
                      onChange={(e) => setActiveRole({ ...activeRole, description: e.target.value })}
                      className="text-sm text-muted-foreground font-medium bg-background border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-foreground/20 w-full mt-2 resize-none h-16"
                      placeholder="Role Description"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground font-medium">{activeRole.description || "No description provided."}</p>
                  )}
                </div>
                
                <div className="flex gap-2 self-start md:self-center shrink-0">
                  {!isEditing && !activeRole.isSystem && (
                    <button 
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Role
                    </button>
                  )}
                  {isEditing ? (
                    <>
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          fetchRoles(); // Reset to DB state
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Permissions
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Module Name</th>
                      <th className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Read</th>
                      <th className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Write</th>
                      <th className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {modules.map((mod) => {
                      const perms = activeRole.permissions[mod.id] || [];
                      return (
                        <tr key={mod.id} className="group">
                          <td className="py-5">
                            <p className="font-bold text-foreground text-sm">{mod.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{mod.description}</p>
                          </td>
                          {['read', 'write', 'delete'].map((action) => {
                            const hasPerm = perms.includes(action);
                            return (
                              <td key={action} className="py-5 text-center">
                                <button
                                  type="button"
                                  onClick={() => togglePermission(mod.id, action)}
                                  disabled={!isEditing}
                                  className={cn(
                                    "w-6 h-6 rounded-md mx-auto flex items-center justify-center transition-all",
                                    hasPerm 
                                      ? "bg-foreground text-background" 
                                      : "bg-muted/50 text-muted-foreground/30 hover:text-muted-foreground",
                                    isEditing && "hover:scale-110 active:scale-95 cursor-pointer",
                                    !isEditing && "cursor-default"
                                  )}
                                >
                                  {hasPerm ? <Check className="w-4 h-4" strokeWidth={3} /> : <X className="w-3 h-3" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 glass-panel rounded-[2rem] flex flex-col items-center justify-center text-center p-12">
              <Shield className="w-16 h-16 text-muted-foreground opacity-20 mb-6" />
              <h3 className="text-xl font-black text-foreground">Select a role to manage</h3>
              <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Click on any role from the left sidebar to view and modify its security permissions.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create New Role Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
              className="bg-card w-full max-w-md overflow-hidden relative z-10 rounded-2xl shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                <h2 className="text-base font-semibold text-foreground">Create New Role</h2>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateRole} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Role Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all text-foreground placeholder:text-muted-foreground/50"
                    placeholder="e.g. Moderator, Manager"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all text-foreground placeholder:text-muted-foreground/50 h-24 resize-none"
                    placeholder="Describe what access this role has..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Copy Permissions From (Optional)
                  </label>
                  <div className="relative">
                    <select
                      value={cloneFromRoleId}
                      onChange={(e) => setCloneFromRoleId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all text-foreground appearance-none cursor-pointer"
                    >
                      <option value="">Start from Empty / Default</option>
                      {roles.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-2 flex items-center justify-end gap-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 text-sm font-medium text-background bg-foreground hover:bg-foreground/90 rounded-md transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-card w-full max-w-sm overflow-hidden relative z-10 rounded-2xl shadow-2xl border border-border"
            >
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">Delete Role?</h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to permanently delete the <span className="font-bold text-foreground">"{activeRole?.name}"</span> role? This action cannot be undone and users assigned to this role might lose access.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteRole}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
